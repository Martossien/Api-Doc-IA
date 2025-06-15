#!/usr/bin/env python3
"""
Api-Doc-IA Demo Client
Application GUI de démonstration pour présenter la solution Api-Doc-IA
à des responsables non-techniques.

Auteur: Assistant Claude
Version: 1.0
Date: Juin 2025
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
import requests
import threading
import time
import os
import configparser
import queue
import json
from pathlib import Path
import logging
from typing import Optional, Tuple, Dict, Any
import uuid
import platform

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('demo_client.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class ApiDocIAClient:
    """Client GUI principal pour Api-Doc-IA"""

    def __init__(self):
        self.root = tk.Tk()
        self.config = configparser.ConfigParser()
        self.load_config()
        
        # CORRECTION CRITIQUE: Détection environnement Linux pour optimisations
        self.is_linux = platform.system() == 'Linux'
        if self.is_linux:
            logger.info(f"Détection Linux: {platform.platform()}")
            # CORRECTION CRITIQUE: Optimisations anti-fenêtres fantômes (version simple)
            try:
                self.root.tk.call('tk', 'scaling', 1.0)  # Évite les problèmes de scaling
                # Force l'initialisation complète avant création des widgets
                self.root.update_idletasks()
                self.root.geometry("1x1+0+0")  # Taille temporaire minimale
                self.root.update()  # Force l'affichage immédiat
            except Exception as e:
                logger.warning(f"Erreur optimisations Linux: {e}")
        
        # Variables d'état
        self.current_task_id = None
        self.processing = False
        self.cancel_event = threading.Event()
        self.session = requests.Session()
        self.current_thread = None
        
        # Queue pour communication entre threads
        self.result_queue = queue.Queue()
        
        # Variables tkinter
        self.file_path_var = tk.StringVar()
        self.status_var = tk.StringVar(value="Prêt")
        
        self.setup_ui()
        self.setup_session()
        self.setup_keyboard_bindings()
        
        # Vérification périodique de la queue
        self.root.after(100, self.check_queue)

    def load_config(self):
        """Charge la configuration depuis config.ini"""
        config_file = "config.ini"
        
        # Configuration par défaut
        default_config = {
            'server': {
                'url': 'http://localhost:8080',
                'token': self.config.get('server', 'token', fallback='your-api-key-here')
            },
            'app': {
                'timeout': '300',
                'retry_attempts': '3',
                'chunk_size': '1000',
                'max_tokens': '2000',
                'default_prompt': 'Résume ce document en 3 points clés'
            }
        }
        
        if os.path.exists(config_file):
            self.config.read(config_file)
            current_timeout = self.config.get('app', 'timeout', fallback='60')
            if int(current_timeout) < 300:
                logger.info(f"Mise à jour timeout de {current_timeout}s à 300s")
                self.config.set('app', 'timeout', '300')
                self.save_config()
        else:
            for section, options in default_config.items():
                self.config.add_section(section)
                for key, value in options.items():
                    self.config.set(section, key, value)
            self.save_config()

    def save_config(self):
        """Sauvegarde la configuration"""
        try:
            with open("config.ini", 'w') as f:
                self.config.write(f)
        except Exception as e:
            logger.error(f"Erreur sauvegarde config: {e}")

    def setup_session(self):
        """Configure la session HTTP avec compatibilité urllib3"""
        try:
            from requests.adapters import HTTPAdapter
            from urllib3.util.retry import Retry
            
            retry_config = {
                'total': int(self.config.get('app', 'retry_attempts', fallback='3')),
                'status_forcelist': [429, 500, 502, 503, 504],
                'backoff_factor': 1
            }
            
            # Tentative avec nouvelle syntaxe urllib3 v1.26+
            try:
                retry_config['allowed_methods'] = ["HEAD", "GET", "POST"]
                retry_strategy = Retry(**retry_config)
                logger.info("Utilisation urllib3 moderne (allowed_methods)")
            except TypeError:
                # Fallback pour urllib3 < v1.26
                retry_config.pop('allowed_methods', None)
                retry_config['method_whitelist'] = ["HEAD", "GET", "POST"]
                retry_strategy = Retry(**retry_config)
                logger.info("Utilisation urllib3 legacy (method_whitelist)")
            
            adapter = HTTPAdapter(max_retries=retry_strategy)
            self.session.mount("http://", adapter)
            self.session.mount("https://", adapter)
            logger.info("Session HTTP configurée avec retry")
                
        except Exception as e:
            logger.warning(f"Impossible de configurer retry avancé: {e}")
            logger.info("Utilisation session HTTP basique")

    def setup_keyboard_bindings(self):
        """Configure les raccourcis clavier de manière sécurisée"""
        # CORRECTION CRITIQUE: Bindings simplifiés pour éviter conflits système
        bindings = {
            '<Control-o>': self.keyboard_open_file,
            '<Control-s>': self.keyboard_open_settings,
            '<Return>': self.keyboard_handle_enter,
            '<Escape>': self.keyboard_cancel_analysis
        }
        
        for key, handler in bindings.items():
            try:
                self.root.bind(key, handler)
            except Exception as e:
                logger.debug(f"Binding {key} échoué: {e}")
        
        # CORRECTION CRITIQUE: Suppression des bindings focus agressifs
        # Ces bindings causaient des conflits avec le WM sur Fedora

    def ensure_prompt_editable(self, event=None):
        """S'assure que le prompt reste toujours éditable de manière sécurisée"""
        try:
            if self.prompt_text.cget('state') != 'normal':
                self.prompt_text.config(state='normal')
            # CORRECTION CRITIQUE: Focus sans forcer - évite les conflits WM
            if event and event.widget == self.prompt_text:
                self.prompt_text.focus_set()
        except Exception as e:
            logger.debug(f"Erreur ensure_prompt_editable: {e}")
        return None

    def keyboard_open_file(self, event=None):
        if not self.processing:
            self.browse_file()
        return 'break'

    def keyboard_open_settings(self, event=None):
        self.open_settings()
        return 'break'

    def keyboard_handle_enter(self, event=None):
        if not self.processing and self.file_path_var.get().strip():
            self.start_analysis()
            return 'break'
        return None

    def keyboard_cancel_analysis(self, event=None):
        self.cancel_analysis()
        return 'break'

    def setup_ui(self):
        """Configure l'interface utilisateur"""
        # CORRECTION 3: Taille de fenêtre optimisée pour tout afficher
        self.root.title("Api-Doc-IA Demo Client")
        self.root.geometry("900x850")  # Augmenté pour garantir la visibilité
        self.root.minsize(850, 800)    # Taille minimale augmentée
        
        style = ttk.Style()
        style.theme_use('clam')
        style.configure('Action.TButton', font=('Arial', 10, 'bold'))
        style.configure('Active.TButton', font=('Arial', 10, 'bold'), background='#4CAF50')
        
        self.create_widgets()
        self.setup_layout()

    def create_widgets(self):
        """Crée tous les widgets de l'interface"""
        
        # Frame principal avec padding approprié
        self.main_frame = ttk.Frame(self.root, padding="15")
        
        # Header avec titre et bouton paramètres
        self.header_frame = ttk.Frame(self.main_frame)
        self.title_label = ttk.Label(
            self.header_frame, 
            text="Api-Doc-IA Demo Client", 
            font=('Arial', 14, 'bold')
        )
        # CORRECTION CRITIQUE: Suppression emoji du bouton settings
        self.settings_button = ttk.Button(
            self.header_frame,
            text="Paramètres",
            width=12,
            command=self.open_settings
        )
        
        # Section fichier
        self.file_frame = ttk.LabelFrame(self.main_frame, text="Fichier à analyser", padding="8")
        self.file_entry = ttk.Entry(
            self.file_frame, 
            textvariable=self.file_path_var,
            state='readonly',
            width=55
        )
        self.browse_button = ttk.Button(
            self.file_frame,
            text="Parcourir... (Ctrl+O)",
            command=self.browse_file
        )
        
        # Section prompt - Widget prompt entièrement éditable et sécurisé
        self.prompt_frame = ttk.LabelFrame(self.main_frame, text="Prompt d'analyse", padding="8")
        self.prompt_text = tk.Text(
            self.prompt_frame,
            height=4,
            wrap=tk.WORD,
            font=('Arial', 10),
            state='normal'
        )
        # Insérer le texte par défaut
        default_prompt = self.config.get('app', 'default_prompt', fallback='Résume ce document en 3 points clés')
        self.prompt_text.insert(1.0, default_prompt)
        
        # CORRECTION CRITIQUE: Bindings sécurisés pour éviter conflits système
        self.prompt_text.bind("<Button-1>", self.ensure_prompt_editable, add='+')
        self.prompt_text.bind("<KeyPress>", self.ensure_prompt_editable, add='+')
        self.prompt_text.bind("<FocusIn>", self.ensure_prompt_editable, add='+')
        
        # CORRECTION CRITIQUE: Suppression emoji du bouton analyse
        self.analyze_button = ttk.Button(
            self.main_frame,
            text="ANALYSER (Enter)",
            style='Action.TButton',
            command=self.start_analysis,
            state='disabled'
        )
        
        # Section résultat avec hauteur réduite pour laisser place aux éléments du bas
        self.result_frame = ttk.LabelFrame(self.main_frame, text="Résultat de l'analyse", padding="8")
        self.result_text = scrolledtext.ScrolledText(
            self.result_frame,
            height=16,  # Réduit de 20 à 16 pour laisser place aux éléments du bas
            wrap=tk.WORD,
            font=('Arial', 10),
            state='disabled'
        )
        
        # Barre de statut et progression
        self.status_frame = ttk.Frame(self.main_frame)
        self.status_label = ttk.Label(self.status_frame, textvariable=self.status_var)
        self.progress_bar = ttk.Progressbar(
            self.status_frame,
            mode='indeterminate',
            length=250  # Augmenté de 200 à 250
        )
        self.cancel_button = ttk.Button(
            self.status_frame,
            text="Annuler (Esc)",
            command=self.cancel_analysis,
            state='normal'
        )
        
        # Zone d'information mise à jour (sans emoji)
        self.info_label = ttk.Label(
            self.main_frame,
            text="Sélectionnez un document, modifiez le prompt si nécessaire, puis cliquez sur ANALYSER",
            foreground='blue',
            font=('Arial', 9),
            wraplength=800  # Augmenté pour la nouvelle largeur
        )

    def setup_layout(self):
        """Configure la disposition des widgets avec amélioration du layout"""
        
        # CORRECTION 2: Utilisation optimale de fill et expand
        self.main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Header
        self.header_frame.pack(fill=tk.X, pady=(0, 15))
        self.title_label.pack(side=tk.LEFT)
        self.settings_button.pack(side=tk.RIGHT)
        
        # Section fichier
        self.file_frame.pack(fill=tk.X, pady=(0, 12))
        self.file_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 8))
        self.browse_button.pack(side=tk.RIGHT)
        
        # Section prompt
        self.prompt_frame.pack(fill=tk.X, pady=(0, 12))
        self.prompt_text.pack(fill=tk.BOTH, expand=True)
        
        # Bouton analyse
        self.analyze_button.pack(pady=15)
        
        # Section résultat - CORRECTION 2: Meilleur expand/fill pour utiliser tout l'espace
        self.result_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 12))
        self.result_text.pack(fill=tk.BOTH, expand=True)
        
        # Barre de statut
        self.status_frame.pack(fill=tk.X, pady=(0, 8))
        self.status_label.pack(side=tk.LEFT)
        self.progress_bar.pack(side=tk.LEFT, padx=(15, 8))
        self.cancel_button.pack(side=tk.RIGHT)
        
        # Info
        self.info_label.pack(fill=tk.X)

    def browse_file(self):
        """Ouvre le dialogue de sélection de fichier"""
        try:
            file_types = [
                ("Tous les documents", "*.pdf *.docx *.doc *.txt *.md *.csv *.xlsx *.xls *.ppt *.pptx *.rtf *.xml *.json *.rst *.epub *.mp3 *.wav *.m4a *.mp4"),
                ("PDF", "*.pdf"),
                ("Microsoft Office", "*.docx *.doc *.xlsx *.xls *.ppt *.pptx"), 
                ("Texte et Markdown", "*.txt *.md *.rst *.rtf"),
                ("Données", "*.csv *.xml *.json"),
                ("Formats spécialisés", "*.epub"),
                ("Audio", "*.mp3 *.wav *.m4a *.mp4"),
                ("Tous les fichiers", "*.*")
            ]
            
            filename = filedialog.askopenfilename(
                title="Sélectionner un document à analyser",
                filetypes=file_types
            )
            
            if filename:
                self.file_path_var.set(filename)
                file_size = self.get_file_size_info(filename)
                self.update_result(f"Fichier sélectionné: {os.path.basename(filename)}\n")
                self.update_result(f"Taille: {file_size}\n")
                self.status_var.set("Fichier sélectionné - Prêt pour l'analyse")
                self.enable_analyze_button()
                
        except Exception as e:
            logger.error(f"Erreur sélection fichier: {e}")
            messagebox.showerror("Erreur", f"Erreur lors de la sélection du fichier:\n{e}")

    def get_file_size_info(self, filepath):
        """Retourne la taille du fichier dans un format lisible"""
        try:
            size = os.path.getsize(filepath)
            if size < 1024:
                return f"{size} octets"
            elif size < 1024 * 1024:
                return f"{size / 1024:.1f} KB"
            elif size < 1024 * 1024 * 1024:
                return f"{size / (1024 * 1024):.1f} MB"
            else:
                return f"{size / (1024 * 1024 * 1024):.1f} GB"
        except:
            return "Taille inconnue"

    def enable_analyze_button(self):
        """Active le bouton d'analyse"""
        self.analyze_button.config(state='normal')
        self.analyze_button.configure(style='Active.TButton')
        
        # Force multiple pour compatibilité Linux
        self.root.update_idletasks()
        self.root.after(50, lambda: self.analyze_button.config(state='normal'))
        self.root.after(100, lambda: self.analyze_button.config(state='normal'))

    def validate_inputs(self) -> Tuple[bool, str]:
        """Valide les entrées avant analyse"""
        
        file_path = self.file_path_var.get().strip()
        if not file_path:
            return False, "Veuillez sélectionner un fichier"
        
        if not os.path.exists(file_path):
            return False, "Le fichier sélectionné n'existe pas"
        
        # Vérification de la taille du fichier (limite 500MB)
        try:
            file_size = os.path.getsize(file_path)
            if file_size > 500 * 1024 * 1024:  # 500MB
                return False, "Le fichier est trop volumineux (limite: 500MB)"
        except:
            return False, "Impossible de lire le fichier"
        
        # CORRECTION 2: Suppression de la validation des formats côté client
        # Le serveur décidera des formats acceptés
        
        prompt = self.prompt_text.get(1.0, tk.END).strip()
        if not prompt:
            return False, "Veuillez saisir un prompt d'analyse"
        
        return True, "OK"

    def start_analysis(self):
        """Démarre l'analyse du document"""
        
        # Validation des entrées
        valid, message = self.validate_inputs()
        if not valid:
            messagebox.showerror("Erreur de validation", message)
            return
        
        if self.processing:
            messagebox.showwarning("Attention", "Une analyse est déjà en cours")
            return
        
        # Démarrage de l'analyse
        self.processing = True
        self.cancel_event.clear()
        
        # UI en mode traitement
        self.analyze_button.config(state='disabled')
        self.browse_button.config(state='disabled')
        self.progress_bar.config(mode='indeterminate')
        self.progress_bar.start()
        
        self.update_result("Démarrage de l'analyse...\n")
        self.status_var.set("Préparation...")
        
        # Lancement du thread d'analyse avec gestion sécurisée Linux
        analysis_thread = threading.Thread(
            target=self.analyze_document_thread,
            daemon=True,
            name="AnalysisThread"  # CORRECTION CRITIQUE: Nommage pour debug
        )
        analysis_thread.start()
        
        # CORRECTION CRITIQUE: Référence au thread pour nettoyage Linux
        self.current_thread = analysis_thread

    def analyze_document_thread(self):
        """Thread d'analyse du document"""
        try:
            file_path = self.file_path_var.get()
            prompt = self.prompt_text.get(1.0, tk.END).strip()
            
            # Paramètres d'analyse
            base_url = self.config.get('server', 'url')
            api_key = self.config.get('server', 'token')
            headers = {"Authorization": f"Bearer {api_key}"}
            
            file_name = os.path.basename(file_path)
            
            self.result_queue.put(("status", "Upload du document..."))
            
            # Phase 1: Upload
            with open(file_path, 'rb') as f:
                files = {'file': (file_name, f)}
                data = {
                    'prompt': prompt,
                    'max_tokens': self.config.get('app', 'max_tokens', fallback='2000'),
                    'rag_full_context': 'true',
                    'chunk_size': self.config.get('app', 'chunk_size', fallback='1000')
                }
                
                start_time = time.time()
                
                response = self.session.post(
                    f"{base_url}/api/v2/process",
                    headers=headers,
                    files=files,
                    data=data,
                    timeout=120
                )
                
                if response.status_code != 200:
                    error_msg = response.text[:200] if response.text else f"Erreur HTTP {response.status_code}"
                    raise Exception(f"Erreur upload ({response.status_code}): {error_msg}")
                
                result = response.json()
                task_id = result.get("task_id")
                
                if not task_id:
                    raise Exception("Task ID manquant dans la réponse")
                
                self.current_task_id = task_id
                self.result_queue.put(("status", f"Upload terminé - Task ID: {task_id[:8]}..."))
                self.result_queue.put(("result", f"Analyse en cours...\n"))
                
            # Phase 2: Polling
            timeout = int(self.config.get('app', 'timeout', fallback='300'))
            poll_interval = 1
            
            for attempt in range(timeout):
                if self.cancel_event.is_set():
                    self.result_queue.put(("error", "Analyse annulée par l'utilisateur"))
                    return
                
                # Sleep par petits morceaux pour réactivité d'annulation
                for micro_sleep in range(10):  # 10 x 0.1s = 1s
                    if self.cancel_event.is_set():
                        self.result_queue.put(("error", "Analyse annulée"))
                        return
                    time.sleep(0.1)
                
                elapsed = time.time() - start_time
                
                try:
                    status_resp = self.session.get(
                        f"{base_url}/api/v2/status/{task_id}",
                        headers=headers,
                        timeout=10
                    )
                    
                    if status_resp.status_code != 200:
                        continue  # Retry
                    
                    status_data = status_resp.json()
                    status = status_data.get("status")
                    progress = status_data.get("progress", 0)
                    
                    # Mise à jour du statut
                    self.result_queue.put(("progress", progress))
                    self.result_queue.put(("status", f"{status.title()} ({progress}%) - {elapsed:.0f}s"))
                    
                    if status == "completed":
                        content = status_data.get("result", {}).get("content", "")
                        
                        if content:
                            self.result_queue.put(("success", {
                                "content": content,
                                "elapsed": elapsed,
                                "task_id": task_id
                            }))
                        else:
                            self.result_queue.put(("error", "Résultat vide reçu du serveur"))
                        return
                        
                    elif status == "failed":
                        error = status_data.get("error", "Erreur inconnue")
                        self.result_queue.put(("error", f"Échec de l'analyse: {error}"))
                        return
                    
                except requests.exceptions.RequestException as e:
                    logger.warning(f"Erreur polling (tentative {attempt}): {e}")
                    continue
            
            # Timeout
            self.result_queue.put(("error", f"Timeout après {timeout}s"))
            
        except Exception as e:
            logger.error(f"Erreur analyse: {e}")
            self.result_queue.put(("error", f"Erreur: {str(e)}"))

    def check_queue(self):
        """Vérifie la queue de résultats (appelé périodiquement)"""
        try:
            while not self.result_queue.empty():
                message_type, data = self.result_queue.get_nowait()
                
                if message_type == "status":
                    self.status_var.set(data)
                    
                elif message_type == "result":
                    self.update_result(data)
                    
                elif message_type == "progress":
                    if data > 0:
                        self.progress_bar.config(mode='determinate')
                        self.progress_bar['value'] = data
                    
                elif message_type == "success":
                    self.handle_success(data)
                    
                elif message_type == "error":
                    self.handle_error(data)
                    
        except queue.Empty:
            pass
        finally:
            # Programmer la prochaine vérification
            self.root.after(100, self.check_queue)

    def handle_success(self, data):
        """Gère le succès de l'analyse"""
        content = data["content"]
        elapsed = data["elapsed"]
        task_id = data["task_id"]
        
        # Mise à jour de l'interface
        self.progress_bar.stop()
        self.progress_bar['value'] = 100
        self.status_var.set(f"Analyse terminée en {elapsed:.1f}s")
        
        # Affichage du résultat (sans emojis)
        result_text = f"""
RÉSULTAT DE L'ANALYSE
{'='*50}
Temps de traitement: {elapsed:.1f} secondes
Task ID: {task_id}
Contenu analysé: {len(content)} caractères

{content}

{'='*50}
Analyse terminée avec succès
"""
        
        self.update_result(result_text, clear=True)
        
        # Auto-scroll vers le début
        self.result_text.see(1.0)
        
        # Réinitialisation de l'interface
        self.reset_ui()
        
        # Notification système si disponible
        try:
            self.root.bell()  # Son système
        except:
            pass

    def handle_error(self, error_message):
        """Gère les erreurs d'analyse"""
        self.progress_bar.stop()
        self.status_var.set("Erreur")
        
        error_text = f"""
ERREUR LORS DE L'ANALYSE
{'='*50}
{error_message}

Suggestions:
• Vérifiez la connexion au serveur
• Vérifiez le format du fichier
• Réduisez la taille du fichier si nécessaire
• Contactez l'administrateur si le problème persiste

{'='*50}
"""
        
        self.update_result(error_text, clear=True)
        self.reset_ui()
        
        # Affichage d'une boîte de dialogue d'erreur
        messagebox.showerror("Erreur d'analyse", f"L'analyse a échoué:\n\n{error_message}")

    def cancel_analysis(self):
        """Annule l'analyse en cours"""
        if self.processing:
            self.cancel_event.set()
            self.status_var.set("Annulation en cours...")
            self.update_result("Annulation demandée...\n")
            
            # Force l'arrêt après 3 secondes si le thread ne répond pas
            self.root.after(3000, self.force_stop_if_stuck)
        else:
            # Reset de l'interface si pas d'analyse en cours
            self.reset_ui()
            self.status_var.set("Interface réinitialisée")

    def force_stop_if_stuck(self):
        """Force l'arrêt si l'annulation n'a pas fonctionné"""
        if self.processing and self.cancel_event.is_set():
            logger.warning("Forçage arrêt - thread ne répond pas")
            self.processing = False
            self.handle_error("Analyse forcée à l'arrêt (thread bloqué)")

    def reset_ui(self):
        """Remet l'interface en état initial"""
        self.processing = False
        self.cancel_event.clear()
        self.current_task_id = None
        self.current_thread = None
        
        if self.file_path_var.get().strip():
            self.enable_analyze_button()
        else:
            self.analyze_button.config(state='disabled')
            
        self.browse_button.config(state='normal')
        self.progress_bar.stop()
        self.progress_bar['value'] = 0

    def update_result(self, text, clear=False):
        """Met à jour la zone de résultat"""
        self.result_text.config(state='normal')
        
        if clear:
            self.result_text.delete(1.0, tk.END)
        
        self.result_text.insert(tk.END, text)
        self.result_text.see(tk.END)  # Auto-scroll
        self.result_text.config(state='disabled')

    def open_settings(self):
        """Ouvre la fenêtre de configuration"""
        SettingsWindow(self)

    def run(self):
        """Lance l'application avec gestion propre des ressources"""
        try:
            # CORRECTION CRITIQUE: Gestionnaire de fermeture propre
            self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
            
            # CORRECTION CRITIQUE: Nettoyage simple des fenêtres fantômes (version light)
            if self.is_linux:
                self.cleanup_phantom_windows_light()
            
            # Message de bienvenue (sans emojis)
            welcome_text = f"""
BIENVENUE DANS API-DOC-IA DEMO CLIENT
{'='*60}

Cette application de démonstration vous permet de tester
l'analyse de documents avec l'intelligence artificielle.

ÉTAPES SIMPLES:
1. Cliquez sur "Parcourir..." pour sélectionner un document
2. Modifiez le prompt d'analyse si nécessaire  
3. Cliquez sur "ANALYSER" pour lancer l'analyse
4. Attendez le résultat (quelques secondes à 1 minute)

FORMATS SUPPORTÉS: 
• Documents : PDF, DOCX, DOC, TXT, RTF
• Markup : MD, RST  
• Données : CSV, XML, JSON
• Office : XLSX, XLS, PPT, PPTX
• Spécialisés : EPUB
• Audio : MP3, WAV, M4A (avec transcription IA)

Cliquez sur "Paramètres" en haut à droite pour la configuration

Prêt pour l'analyse !
{'='*60}
"""
            
            self.update_result(welcome_text)
            
            # Démarrage de l'interface
            self.root.mainloop()
            
        except KeyboardInterrupt:
            logger.info("Arrêt demandé par l'utilisateur")
        except Exception as e:
            logger.error(f"Erreur fatale: {e}")
            messagebox.showerror("Erreur fatale", f"Une erreur grave s'est produite:\n{e}")
        finally:
            # CORRECTION CRITIQUE: Nettoyage complet des ressources (version simple)
            self.cleanup_resources_light()

    def on_closing(self):
        """Gestionnaire de fermeture propre - VERSION SIMPLE"""
        try:
            logger.info("Fermeture propre de l'application...")
            
            # Arrêter toutes les opérations en cours
            if self.processing:
                self.cancel_event.set()
                logger.info("Arrêt des opérations en cours...")
            
            # CORRECTION CRITIQUE: Nettoyage simple mais efficace
            if self.is_linux:
                self.cleanup_phantom_windows_light()
            
            # Fermer la session HTTP proprement
            if hasattr(self, 'session'):
                try:
                    self.session.close()
                except:
                    pass
            
            # CORRECTION CRITIQUE: Destruction simple
            try:
                self.root.quit()
                self.root.destroy()
            except Exception as e:
                logger.warning(f"Erreur fermeture finale: {e}")
                # Force la fermeture même en cas d'erreur
                try:
                    self.root.destroy()
                except:
                    pass
            
            logger.info("Fermeture propre terminée")
            
        except Exception as e:
            logger.warning(f"Erreur fermeture: {e}")
            # Force la fermeture même en cas d'erreur
            try:
                self.root.destroy()
            except:
                pass

    def cleanup_resources_light(self):
        """Nettoyage des ressources - VERSION SIMPLE"""
        try:
            logger.info("Nettoyage des ressources...")
            
            # Arrêt des threads et événements
            if hasattr(self, 'cancel_event'):
                self.cancel_event.set()
                
            # Attente propre des threads sur Linux
            if hasattr(self, 'current_thread') and self.current_thread and self.current_thread.is_alive():
                logger.info("Attente fin thread analyse...")
                self.current_thread.join(timeout=2.0)  # Attente max 2s
                
            # Nettoyage fenêtres fantômes Linux simple
            if self.is_linux:
                self.cleanup_phantom_windows_light()
                
            # Fermeture session HTTP
            if hasattr(self, 'session'):
                try:
                    self.session.close()
                except:
                    pass
                    
            # Vidage des queues
            if hasattr(self, 'result_queue'):
                try:
                    while not self.result_queue.empty():
                        self.result_queue.get_nowait()
                except:
                    pass
                    
            logger.info("Ressources nettoyées")
            
        except Exception as e:
            logger.warning(f"Erreur nettoyage: {e}")

    def cleanup_phantom_windows_light(self):
        """Nettoyage simple des fenêtres fantômes"""
        try:
            logger.debug("Nettoyage simple des fenêtres fantômes...")
            
            # Nettoyage simple en une passe
            try:
                all_children = self.root.winfo_children()
                for widget in all_children:
                    if isinstance(widget, tk.Toplevel):
                        try:
                            widget.destroy()
                            logger.debug("Fenêtre Toplevel nettoyée")
                        except:
                            pass
            except:
                pass
            
            # Synchronisation simple
            try:
                self.root.update_idletasks()
            except:
                pass
                
            logger.debug("Nettoyage simple terminé")
            
        except Exception as e:
            logger.debug(f"Erreur nettoyage simple: {e}")


class SettingsWindow:
    """Fenêtre de configuration"""
    
    def __init__(self, parent):
        self.parent = parent
        
        # CORRECTION CRITIQUE: Création sécurisée de la fenêtre (version simple)
        try:
            self.window = tk.Toplevel(parent.root)
            
            # Protocol de fermeture pour éviter fenêtres fantômes
            self.window.protocol("WM_DELETE_WINDOW", self.safe_close)
            
            # Configuration sécurisée
            self.setup_window()
            
        except Exception as e:
            logger.error(f"Erreur création SettingsWindow: {e}")
            # Nettoyage en cas d'erreur
            try:
                if hasattr(self, 'window'):
                    self.window.destroy()
            except:
                pass

    def safe_close(self):
        """Fermeture sécurisée pour éviter les fenêtres fantômes - VERSION SIMPLE"""
        try:
            logger.debug("Fermeture sécurisée SettingsWindow...")
            
            # Destruction simple mais propre
            self.window.destroy()
                
        except Exception as e:
            logger.warning(f"Erreur fermeture sécurisée: {e}")
        
    def setup_window(self):
        """Configure la fenêtre de paramètres de manière sécurisée"""
        self.window.title("Configuration Serveur")
        self.window.geometry("650x550")  # Taille optimisée pour boutons visibles
        self.window.minsize(600, 500)    # Taille minimale augmentée
        self.window.resizable(True, True)
        self.window.transient(self.parent.root)
        
        # CORRECTION CRITIQUE: Suppression de grab_set() qui cause des conflits système
        # grab_set() peut bloquer les événements système sur certains WM Linux
        
        # Centrage de la fenêtre
        self.window.update_idletasks()
        x = (self.window.winfo_screenwidth() - self.window.winfo_width()) // 2
        y = (self.window.winfo_screenheight() - self.window.winfo_height()) // 2
        self.window.geometry(f"+{x}+{y}")
        
        self.create_widgets()
        self.load_current_settings()
        
        # Focus sécurisé sans grab
        self.window.focus_set()
        self.window.lift()  # Amène la fenêtre au premier plan
        
    def create_widgets(self):
        """Crée les widgets de la fenêtre de paramètres"""
        
        main_frame = ttk.Frame(self.window, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Titre
        title_label = ttk.Label(main_frame, text="Configuration Serveur", font=('Arial', 12, 'bold'))
        title_label.pack(pady=(0, 20))
        
        # URL Serveur
        url_frame = ttk.LabelFrame(main_frame, text="URL du Serveur", padding="10")
        url_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.url_var = tk.StringVar()
        self.url_entry = ttk.Entry(url_frame, textvariable=self.url_var, width=50)
        self.url_entry.pack(fill=tk.X)
        
        # Token API
        token_frame = ttk.LabelFrame(main_frame, text="Token API", padding="10")
        token_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.token_var = tk.StringVar()
        self.token_entry = ttk.Entry(token_frame, textvariable=self.token_var, width=50, show="*")
        self.token_entry.pack(fill=tk.X, pady=(0, 5))
        
        self.show_token_var = tk.BooleanVar()
        show_token_cb = ttk.Checkbutton(
            token_frame, 
            text="Afficher le token", 
            variable=self.show_token_var,
            command=self.toggle_token_visibility
        )
        show_token_cb.pack()
        
        # Zone de test
        test_frame = ttk.LabelFrame(main_frame, text="Test de Connexion", padding="10")
        test_frame.pack(fill=tk.X, pady=(0, 20))
        
        self.test_result_var = tk.StringVar(value="Cliquez sur 'Tester' pour vérifier la connexion")
        test_result_label = ttk.Label(test_frame, textvariable=self.test_result_var, wraplength=450)
        test_result_label.pack(pady=(0, 10))
        
        # CORRECTION CRITIQUE: Suppression emoji du bouton test
        test_button = ttk.Button(test_frame, text="Tester la Connexion", command=self.test_connection)
        test_button.pack()
        
        # Zone de statut de sauvegarde
        self.save_status_frame = ttk.Frame(main_frame)
        self.save_status_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.save_status_var = tk.StringVar(value="")
        self.save_status_label = ttk.Label(
            self.save_status_frame, 
            textvariable=self.save_status_var,
            foreground='green',
            font=('Arial', 9, 'bold')
        )
        self.save_status_label.pack()
        
        # Boutons d'action (sans emojis)
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X)
        
        cancel_button = ttk.Button(button_frame, text="Annuler", command=self.cancel)
        cancel_button.pack(side=tk.LEFT)
        
        save_button = ttk.Button(button_frame, text="Sauvegarder", command=self.save)
        save_button.pack(side=tk.RIGHT)
        
    def load_current_settings(self):
        """Charge les paramètres actuels"""
        self.url_var.set(self.parent.config.get('server', 'url', fallback=''))
        self.token_var.set(self.parent.config.get('server', 'token', fallback=''))
        
    def toggle_token_visibility(self):
        """Bascule l'affichage du token"""
        if self.show_token_var.get():
            self.token_entry.config(show="")
        else:
            self.token_entry.config(show="*")
    
    def test_connection(self):
        """Teste la connexion avec les paramètres actuels"""
        url = self.url_var.get().strip()
        token = self.token_var.get().strip()
        
        if not url or not token:
            self.test_result_var.set("Veuillez remplir l'URL et le token")
            return
        
        self.test_result_var.set("Test en cours...")
        self.window.update()
        
        try:
            # Test basique de connectivité
            headers = {"Authorization": f"Bearer {token}"}
            
            # Essayer plusieurs endpoints
            test_endpoints = [
                "/api/v2/health",
                "/api/health", 
                "/health",
                "/"
            ]
            
            session = requests.Session()
            session.headers.update(headers)
            
            for endpoint in test_endpoints:
                try:
                    test_url = url.rstrip('/') + endpoint
                    response = session.get(test_url, timeout=10)
                    
                    if response.status_code == 200:
                        self.test_result_var.set(f"Connexion réussie! (endpoint: {endpoint})")
                        return
                    elif response.status_code == 401:
                        self.test_result_var.set("Token invalide (401 Unauthorized)")
                        return
                    elif response.status_code == 403:
                        self.test_result_var.set("Accès refusé (403 Forbidden)")
                        return
                        
                except requests.exceptions.ConnectionError:
                    continue  # Essayer l'endpoint suivant
                except requests.exceptions.Timeout:
                    self.test_result_var.set("Timeout - Serveur trop lent")
                    return
            
            # Aucun endpoint n'a fonctionné
            self.test_result_var.set("Serveur inaccessible - Vérifiez l'URL")
                
        except Exception as e:
            self.test_result_var.set(f"Erreur: {str(e)[:50]}...")
    
    def save(self):
        """Sauvegarde les paramètres"""
        url = self.url_var.get().strip()
        token = self.token_var.get().strip()
        
        if not url or not token:
            messagebox.showerror("Erreur", "Veuillez remplir tous les champs")
            return
        
        # Mise à jour de la configuration
        self.parent.config.set('server', 'url', url)
        self.parent.config.set('server', 'token', token)
        self.parent.save_config()
        
        # Reconfiguration de la session
        self.parent.setup_session()
        
        # Afficher un indicateur de sauvegarde (sans emoji)
        self.save_status_var.set("Configuration sauvegardée avec succès!")
        self.save_status_label.config(foreground='green')
        
        # Fermeture automatique après sauvegarde (plus propre)
        self.window.after(1500, self.safe_close)
    
    def cancel(self):
        """Annule les modifications et ferme la fenêtre proprement"""
        self.safe_close()


if __name__ == "__main__":
    try:
        # Vérification des dépendances
        import requests
        
        # Lancement de l'application
        app = ApiDocIAClient()
        app.run()
        
    except ImportError as e:
        # Gestion spéciale pour environnement PyInstaller
        try:
            import tkinter as tk
            from tkinter import messagebox
            root = tk.Tk()
            root.withdraw()
            messagebox.showerror("Dépendance manquante", 
                               f"Dépendance manquante: {e}\n\nInstallez avec: pip install requests")
        except:
            print(f"Dépendance manquante: {e}")
            print("Installez avec: pip install requests")
        
    except Exception as e:
        # Gestion gracieuse des erreurs pour PyInstaller
        try:
            import tkinter as tk
            from tkinter import messagebox
            root = tk.Tk()
            root.withdraw()
            messagebox.showerror("Erreur", f"Erreur fatale: {e}\n\nConsultez le fichier demo_client.log")
        except:
            print(f"Erreur fatale: {e}")
            print("Consultez le fichier demo_client.log")
        
        # Log de l'erreur
        try:
            import logging
            logging.error(f"Erreur fatale: {e}", exc_info=True)
        except:
            pass
