#!/bin/bash

# =============================================================================
# SCRIPT DE NETTOYAGE DES FENÊTRES FANTÔMES 1x1+-1+-1
# Supprime les fenêtres invisibles qui bloquent les clics sur le bureau
# =============================================================================

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_NAME="Nettoyage Fenêtres Fantômes"
LOG_FILE="phantom_cleanup.log"
BACKUP_FILE="phantom_windows_backup.txt"

# Fonctions utilitaires
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

success_msg() {
    echo -e "${GREEN}✅ $1${NC}"
    log_message "SUCCESS: $1"
}

warning_msg() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    log_message "WARNING: $1"
}

error_msg() {
    echo -e "${RED}❌ $1${NC}"
    log_message "ERROR: $1"
}

info_msg() {
    echo -e "${BLUE}ℹ️  $1${NC}"
    log_message "INFO: $1"
}

# Fonction de vérification des prérequis
check_prerequisites() {
    info_msg "Vérification des prérequis..."
    
    # Vérifier que nous sommes sur Linux avec X11
    if [ ! "$XDG_SESSION_TYPE" = "x11" ] && [ ! "$DISPLAY" ]; then
        error_msg "Ce script nécessite une session X11"
        exit 1
    fi
    
    # Vérifier la présence des outils nécessaires
    local tools=("xwininfo" "xdotool" "wmctrl")
    local missing_tools=()
    
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        warning_msg "Outils manquants: ${missing_tools[*]}"
        info_msg "Installation recommandée:"
        info_msg "sudo dnf install xdotool wmctrl xorg-x11-utils"
        echo
        read -p "Continuer sans ces outils ? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    success_msg "Prérequis vérifiés"
}

# Fonction de sauvegarde
backup_phantom_windows() {
    info_msg "Sauvegarde des fenêtres fantômes détectées..."
    
    # Sauvegarder la liste des fenêtres avant nettoyage
    xwininfo -tree -root | grep "1x1+-1+-1" > "$BACKUP_FILE" 2>/dev/null
    
    local count=$(wc -l < "$BACKUP_FILE" 2>/dev/null || echo "0")
    info_msg "Fenêtres fantômes détectées: $count"
    
    if [ "$count" -gt 0 ]; then
        info_msg "Sauvegarde dans: $BACKUP_FILE"
        return 0
    else
        success_msg "Aucune fenêtre fantôme détectée !"
        return 1
    fi
}

# Fonction d'extraction des IDs de fenêtres
extract_window_ids() {
    local window_ids=()
    
    # Extraire les IDs hexadécimaux des fenêtres 1x1+-1+-1
    while IFS= read -r line; do
        if [[ $line =~ 0x[0-9a-fA-F]+ ]]; then
            local window_id="${BASH_REMATCH[0]}"
            window_ids+=("$window_id")
        fi
    done < "$BACKUP_FILE"
    
    printf '%s\n' "${window_ids[@]}"
}

# Fonction de fermeture des fenêtres - Méthode 1: xdotool
close_with_xdotool() {
    local window_id="$1"
    local success=false
    
    if command -v xdotool &> /dev/null; then
        # Convertir hex en décimal pour xdotool
        local decimal_id=$((window_id))
        
        # Essayer différentes méthodes xdotool
        local methods=("windowclose" "windowkill" "windowunmap")
        
        for method in "${methods[@]}"; do
            if xdotool "$method" "$decimal_id" 2>/dev/null; then
                success=true
                break
            fi
        done
    fi
    
    echo "$success"
}

# Fonction de fermeture des fenêtres - Méthode 2: wmctrl
close_with_wmctrl() {
    local window_id="$1"
    local success=false
    
    if command -v wmctrl &> /dev/null; then
        # wmctrl utilise les IDs hexadécimaux directement
        if wmctrl -ic "$window_id" 2>/dev/null; then
            success=true
        fi
    fi
    
    echo "$success"
}

# Fonction de fermeture des fenêtres - Méthode 3: X11 direct
close_with_x11() {
    local window_id="$1"
    local success=false
    
    # Utiliser xkill pour forcer la fermeture
    if command -v xkill &> /dev/null; then
        # xkill avec ID spécifique (nécessite confirmation utilisateur)
        # On évite cette méthode car interactive
        success=false
    fi
    
    echo "$success"
}

# Fonction principale de nettoyage
cleanup_phantom_windows() {
    local window_ids=($(extract_window_ids))
    local cleaned=0
    local failed=0
    
    if [ ${#window_ids[@]} -eq 0 ]; then
        success_msg "Aucune fenêtre fantôme à nettoyer"
        return 0
    fi
    
    info_msg "Nettoyage de ${#window_ids[@]} fenêtres fantômes..."
    
    for window_id in "${window_ids[@]}"; do
        info_msg "Traitement de la fenêtre: $window_id"
        
        local closed=false
        
        # Méthode 1: xdotool
        if [ "$closed" = false ]; then
            if [ "$(close_with_xdotool "$window_id")" = "true" ]; then
                success_msg "Fenêtre $window_id fermée avec xdotool"
                closed=true
            fi
        fi
        
        # Méthode 2: wmctrl
        if [ "$closed" = false ]; then
            if [ "$(close_with_wmctrl "$window_id")" = "true" ]; then
                success_msg "Fenêtre $window_id fermée avec wmctrl"
                closed=true
            fi
        fi
        
        # Vérifier si la fenêtre existe encore
        if [ "$closed" = false ]; then
            if ! xwininfo -id "$window_id" &>/dev/null; then
                success_msg "Fenêtre $window_id n'existe plus"
                closed=true
            fi
        fi
        
        if [ "$closed" = true ]; then
            ((cleaned++))
        else
            warning_msg "Impossible de fermer la fenêtre $window_id"
            ((failed++))
        fi
        
        # Petite pause entre les fermetures
        sleep 0.1
    done
    
    success_msg "Nettoyage terminé: $cleaned fermées, $failed échecs"
}

# Fonction de vérification post-nettoyage
verify_cleanup() {
    info_msg "Vérification du nettoyage..."
    
    # Forcer la synchronisation X11
    if command -v xset &> /dev/null; then
        xset r on &>/dev/null
    fi
    
    sleep 1
    
    # Compter les fenêtres restantes
    local remaining=$(xwininfo -tree -root | grep -c "1x1+-1+-1" 2>/dev/null || echo "0")
    local initial=$(wc -l < "$BACKUP_FILE" 2>/dev/null || echo "0")
    local cleaned=$((initial - remaining))
    
    if [ "$remaining" -eq 0 ]; then
        success_msg "✨ EXCELLENT! Toutes les fenêtres fantômes ont été supprimées!"
        success_msg "Fenêtres nettoyées: $cleaned/$initial"
    elif [ "$remaining" -lt "$initial" ]; then
        success_msg "Nettoyage partiel réussi"
        info_msg "Fenêtres nettoyées: $cleaned/$initial"
        warning_msg "Fenêtres restantes: $remaining"
    else
        warning_msg "Aucune fenêtre n'a pu être supprimée"
        info_msg "Il peut s'agir de fenêtres système protégées"
    fi
    
    # Sauvegarder l'état final
    xwininfo -tree -root | grep "1x1+-1+-1" > "phantom_windows_after.txt" 2>/dev/null
    info_msg "État final sauvegardé dans: phantom_windows_after.txt"
}

# Fonction d'affichage de l'aide
show_help() {
    echo -e "${CYAN}=== $SCRIPT_NAME ===${NC}"
    echo
    echo "Ce script supprime les fenêtres fantômes 1x1+-1+-1 qui peuvent"
    echo "bloquer les clics sur certaines zones du bureau Linux."
    echo
    echo "UTILISATION:"
    echo "  $0 [OPTIONS]"
    echo
    echo "OPTIONS:"
    echo "  -h, --help     Afficher cette aide"
    echo "  -v, --verbose  Mode verbeux"
    echo "  -s, --safe     Mode sécurisé (demande confirmation)"
    echo "  -f, --force    Mode forcé (sans confirmation)"
    echo "  -c, --count    Compter seulement (pas de suppression)"
    echo
    echo "EXEMPLES:"
    echo "  $0                # Nettoyage interactif"
    echo "  $0 --count       # Compter les fenêtres fantômes"
    echo "  $0 --force       # Nettoyage automatique"
    echo
}

# Fonction de comptage seulement
count_only() {
    local count=$(xwininfo -tree -root | grep -c "1x1+-1+-1" 2>/dev/null || echo "0")
    
    if [ "$count" -eq 0 ]; then
        success_msg "Aucune fenêtre fantôme détectée"
    else
        info_msg "Fenêtres fantômes détectées: $count"
        echo
        echo "Liste des fenêtres:"
        xwininfo -tree -root | grep "1x1+-1+-1" | head -10
        if [ "$count" -gt 10 ]; then
            echo "... et $((count - 10)) autres"
        fi
    fi
}

# Fonction principale
main() {
    local mode="interactive"
    local verbose=false
    
    # Traitement des arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--verbose)
                verbose=true
                shift
                ;;
            -s|--safe)
                mode="safe"
                shift
                ;;
            -f|--force)
                mode="force"
                shift
                ;;
            -c|--count)
                mode="count"
                shift
                ;;
            *)
                error_msg "Option inconnue: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Affichage du header
    echo -e "${CYAN}"
    echo "============================================="
    echo "     $SCRIPT_NAME"
    echo "   Suppression des fenêtres 1x1+-1+-1"
    echo "============================================="
    echo -e "${NC}"
    
    # Mode comptage seulement
    if [ "$mode" = "count" ]; then
        count_only
        exit 0
    fi
    
    # Vérifications préliminaires
    check_prerequisites
    
    # Sauvegarde et détection
    if ! backup_phantom_windows; then
        exit 0
    fi
    
    # Demande de confirmation selon le mode
    if [ "$mode" = "safe" ] || [ "$mode" = "interactive" ]; then
        echo
        warning_msg "ATTENTION: Ce script va tenter de fermer les fenêtres fantômes"
        warning_msg "Certaines peuvent être importantes pour le système"
        echo
        read -p "Voulez-vous continuer ? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            info_msg "Nettoyage annulé par l'utilisateur"
            exit 0
        fi
    fi
    
    # Nettoyage
    cleanup_phantom_windows
    
    # Vérification
    verify_cleanup
    
    echo
    success_msg "Script terminé. Consultez $LOG_FILE pour les détails."
}

# Point d'entrée
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi