#!/bin/bash
# Subtaste Genome Backup & Restore
# Prevents data loss from manual DB updates or recomputation bugs
#
# Usage:
#   ./genome-backup.sh backup          # Save current genome to timestamped file
#   ./genome-backup.sh restore [file]  # Restore from file (default: genome_gold_backup.json)
#   ./genome-backup.sh verify          # Check current genome state
#   ./genome-backup.sh list            # List all backups

USER_ID="69cbf21c3f9d2e0cf0c699c5"
BACKUP_DIR="$(dirname "$0")/genome_backups"
GOLD_BACKUP="$(dirname "$0")/genome_gold_backup.json"

case "${1:-verify}" in
  backup)
    mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    OUTFILE="$BACKUP_DIR/genome_${TIMESTAMP}.json"

    mongosh --quiet subtaste_auth --eval "
      var g = db.taste_genomes.findOne({userId: ObjectId('$USER_ID')});
      print(JSON.stringify(g.distribution));
    " > "$OUTFILE" 2>/dev/null

    # Verify it's valid JSON with the right primary
    PRIMARY=$(node -e "const g=require('$OUTFILE'); console.log(g.archetype.primary.designation, g.archetype.primary.glyph)" 2>/dev/null)

    if [ -z "$PRIMARY" ]; then
      echo "ERROR: Backup failed - invalid JSON"
      rm -f "$OUTFILE"
      exit 1
    fi

    echo "Backed up to: $OUTFILE"
    echo "Primary: $PRIMARY"
    echo "Size: $(wc -c < "$OUTFILE") bytes"
    ;;

  restore)
    RESTORE_FILE="${2:-$GOLD_BACKUP}"

    if [ ! -f "$RESTORE_FILE" ]; then
      echo "ERROR: File not found: $RESTORE_FILE"
      exit 1
    fi

    # Verify source file
    PRIMARY=$(node -e "const g=require('$RESTORE_FILE'); console.log(g.archetype.primary.designation, g.archetype.primary.glyph)" 2>/dev/null)
    HAS_ENGINE=$(node -e "const g=require('$RESTORE_FILE'); console.log(g._engine ? 'yes' : 'MISSING')" 2>/dev/null)
    HAS_BEHAVIOUR=$(node -e "const g=require('$RESTORE_FILE'); console.log(g.behaviour ? 'yes' : 'MISSING')" 2>/dev/null)
    HAS_CROSSMODAL=$(node -e "const g=require('$RESTORE_FILE'); console.log(g.crossModal ? 'yes' : 'MISSING')" 2>/dev/null)

    echo "Restoring from: $RESTORE_FILE"
    echo "Primary: $PRIMARY"
    echo "_engine: $HAS_ENGINE | behaviour: $HAS_BEHAVIOUR | crossModal: $HAS_CROSSMODAL"

    if [ "$HAS_ENGINE" = "MISSING" ] || [ "$HAS_BEHAVIOUR" = "MISSING" ] || [ "$HAS_CROSSMODAL" = "MISSING" ]; then
      echo "ERROR: Incomplete genome - missing required fields. Aborting."
      exit 1
    fi

    # Save pre-restore backup
    mkdir -p "$BACKUP_DIR"
    mongosh --quiet subtaste_auth --eval "
      var g = db.taste_genomes.findOne({userId: ObjectId('$USER_ID')});
      print(JSON.stringify(g.distribution));
    " > "$BACKUP_DIR/genome_pre_restore_$(date +%Y%m%d_%H%M%S).json" 2>/dev/null

    # Restore
    GENOME_JSON=$(cat "$RESTORE_FILE")
    mongosh --quiet subtaste_auth --eval "
      var genome = $GENOME_JSON;
      var result = db.taste_genomes.updateOne(
        {userId: ObjectId('$USER_ID')},
        {\$set: {
          distribution: genome,
          primary: genome.archetype.primary.designation,
          secondary: genome.archetype.secondary.designation,
          confidence: genome.archetype.primary.confidence
        }}
      );
      print('Modified:', result.modifiedCount);

      db.genome_versions.insertOne({
        userId: ObjectId('$USER_ID'),
        genome: genome,
        trigger: 'manual_restore',
        primary: genome.archetype.primary.designation,
        secondary: genome.archetype.secondary.designation,
        confidence: genome.archetype.primary.confidence,
        signalCount: genome.signalCount || 70,
        version: genome.version || 1,
        createdAt: new Date()
      });
    " 2>/dev/null

    echo "Restored. Restart subtaste server to pick up changes."
    ;;

  verify)
    mongosh --quiet subtaste_auth --eval "
      var g = db.taste_genomes.findOne({userId: ObjectId('$USER_ID')});
      var d = g.distribution;
      print('Primary:', d.archetype.primary.designation, d.archetype.primary.glyph, 'conf:', (d.archetype.primary.confidence * 100).toFixed(1) + '%');
      print('Secondary:', d.archetype.secondary.designation, d.archetype.secondary.glyph);
      print('Signals:', d.signalCount || g.signalCount);
      print('_engine:', d._engine ? 'OK' : 'MISSING');
      print('behaviour:', d.behaviour ? 'OK' : 'MISSING');
      print('crossModal:', d.crossModal ? 'OK' : 'MISSING');
      print('Versions:', db.genome_versions.countDocuments({userId: ObjectId('$USER_ID')}));
    " 2>/dev/null
    ;;

  list)
    echo "=== Gold backup ==="
    if [ -f "$GOLD_BACKUP" ]; then
      echo "  $GOLD_BACKUP ($(wc -c < "$GOLD_BACKUP") bytes)"
    else
      echo "  MISSING"
    fi
    echo ""
    echo "=== Timestamped backups ==="
    if [ -d "$BACKUP_DIR" ]; then
      ls -la "$BACKUP_DIR"/genome_*.json 2>/dev/null || echo "  None"
    else
      echo "  None"
    fi
    echo ""
    echo "=== MongoDB versions ==="
    mongosh --quiet subtaste_auth --eval "
      var versions = db.genome_versions.find({userId: ObjectId('$USER_ID')}).sort({createdAt: -1}).toArray();
      versions.forEach(function(v) {
        print('  ' + v.primary + ' ' + v.trigger + ' signals=' + v.signalCount + ' at=' + v.createdAt);
      });
      if (versions.length === 0) print('  None');
    " 2>/dev/null
    ;;

  *)
    echo "Usage: $0 {backup|restore [file]|verify|list}"
    exit 1
    ;;
esac
