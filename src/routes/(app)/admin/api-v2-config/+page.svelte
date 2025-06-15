<!-- Interface d'administration API v2 complète - Version Simple -->
<svelte:head>
	<title>Administration API v2</title>
</svelte:head>

<div class="flex flex-col justify-between w-full overflow-y-auto h-screen">
	<div class="max-w-6xl mx-auto p-8 w-full">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
			 Administration API v2
		</h1>
		
		<!-- Status Bar -->
		<div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-8 flex justify-between items-center">
			<div class="flex items-center space-x-4">
				<div id="connection-status" class="flex items-center">
					<div class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
					<span class="text-sm">Connecting...</span>
				</div>
				<div id="auth-status" class="text-sm text-gray-600">
					Checking authentication...
				</div>
			</div>
			<div class="flex space-x-2">
				<button onclick="loadConfig()" class="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
					 Recharger
				</button>
				<button onclick="saveConfig()" class="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
					 Sauvegarder
				</button>
			</div>
		</div>

		<!-- Configuration Sections -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			
			<!-- Configuration LLM -->
			<div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
					 Configuration LLM
				</h2>
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Modèle par défaut
						</label>
						<input type="text" id="default_model" 
							   class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							   placeholder="gpt-4o-mini">
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Température (0.0-2.0)
						</label>
						<input type="range" id="temperature" min="0" max="2" step="0.1" value="0.7"
							   class="w-full">
						<span id="temperature-value" class="text-sm text-gray-600">0.7</span>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Max Tokens
						</label>
						<input type="number" id="max_tokens" 
							   class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							   placeholder="4096">
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Top P (0.0-1.0)
						</label>
						<input type="range" id="top_p" min="0" max="1" step="0.05" value="0.9"
							   class="w-full">
						<span id="top_p-value" class="text-sm text-gray-600">0.9</span>
					</div>
				</div>
			</div>

			<!-- Limites Système -->
			<div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
					🚦 Limites Système
				</h2>
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Requests par minute
						</label>
						<input type="number" id="rate_limit_requests" 
							   class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							   placeholder="60">
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Tokens par minute
						</label>
						<input type="number" id="rate_limit_tokens" 
							   class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							   placeholder="40000">
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Timeout (secondes)
						</label>
						<input type="number" id="request_timeout" 
							   class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							   placeholder="120">
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Retry attempts
						</label>
						<input type="number" id="retry_attempts" 
							   class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							   placeholder="3">
					</div>
				</div>
			</div>

			<!-- Fonctionnalités de Traitement -->
			<div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
					⚡ Fonctionnalités
				</h2>
				<div class="space-y-4">
					<div class="flex items-center">
						<input type="checkbox" id="streaming_enabled" class="mr-3">
						<label class="text-sm font-medium text-gray-700 dark:text-gray-300">
							Streaming activé
						</label>
					</div>
					<div class="flex items-center">
						<input type="checkbox" id="file_processing_enabled" class="mr-3">
						<label class="text-sm font-medium text-gray-700 dark:text-gray-300">
							Traitement fichiers
						</label>
					</div>
					<div class="flex items-center">
						<input type="checkbox" id="web_search_enabled" class="mr-3">
						<label class="text-sm font-medium text-gray-700 dark:text-gray-300">
							Recherche web
						</label>
					</div>
					<div class="flex items-center">
						<input type="checkbox" id="memory_enabled" class="mr-3">
						<label class="text-sm font-medium text-gray-700 dark:text-gray-300">
							Mémoire conversationnelle
						</label>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Max file size (MB)
						</label>
						<input type="number" id="max_file_size" 
							   class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							   placeholder="50">
					</div>
				</div>
			</div>

			<!-- Gestion Mémoire -->
			<div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
					🧠 Gestion Mémoire
				</h2>
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							TTL mémoire (secondes)
						</label>
						<input type="number" id="memory_ttl" 
							   class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							   placeholder="3600">
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Max entrées mémoire
						</label>
						<input type="number" id="max_memory_entries" 
							   class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							   placeholder="100">
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Stratégie cleanup
						</label>
						<select id="memory_cleanup_strategy" 
								class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
							<option value="lru">LRU (Least Recently Used)</option>
							<option value="fifo">FIFO (First In, First Out)</option>
							<option value="ttl">TTL Based</option>
						</select>
					</div>
				</div>
			</div>
		</div>

		<!-- Templates Section -->
		<div class="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
			<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
				📝 Templates de Prompts
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Template système par défaut
					</label>
					<textarea id="default_system_template" rows="4"
							  class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							  placeholder="Vous êtes un assistant IA utile et informatif..."></textarea>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Template d'erreur
					</label>
					<textarea id="error_template" rows="4"
							  class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							  placeholder="Une erreur s'est produite : {error}"></textarea>
				</div>
			</div>
		</div>

		<!-- Live Monitoring -->
		<div class="mt-8 bg-black text-green-400 p-6 rounded-lg font-mono text-sm">
			<h2 class="text-white text-lg font-semibold mb-4">📊 Monitoring Live</h2>
			<div id="logs" style="max-height: 300px; overflow-y: auto;">
				<div class="text-gray-400">[Initialisation] Interface chargée...</div>
			</div>
		</div>
</div>
</div>

<script>
	// Configuration Management - Client-side JavaScript
	
	let currentConfig = {};
	let isAuthenticated = false;
	let isAdmin = false;
	
	function addLog(message, type = 'info') {
		const timestamp = new Date().toLocaleTimeString();
		const color = type === 'error' ? 'text-red-400' : 
		             type === 'success' ? 'text-green-400' : 
		             type === 'warning' ? 'text-yellow-400' : 'text-gray-300';
		
		const logElement = document.getElementById('logs');
		if (logElement) {
			const logEntry = document.createElement('div');
			logEntry.className = `mb-1 ${color}`;
			logEntry.innerHTML = `<span class="text-gray-500">[${timestamp}]</span> ${message}`;
			logElement.appendChild(logEntry);
			logElement.scrollTop = logElement.scrollHeight;
		}
		
		console.log(` [${timestamp}] ${message}`);
	}
	
	function updateConnectionStatus(status, message) {
		const statusElement = document.getElementById('connection-status');
		if (statusElement) {
			const indicator = statusElement.querySelector('div');
			const text = statusElement.querySelector('span');
			
			if (status === 'connected') {
				indicator.className = 'w-3 h-3 bg-green-500 rounded-full mr-2';
				text.textContent = message || 'Connected';
			} else if (status === 'error') {
				indicator.className = 'w-3 h-3 bg-red-500 rounded-full mr-2';
				text.textContent = message || 'Connection Error';
			} else {
				indicator.className = 'w-3 h-3 bg-yellow-500 rounded-full mr-2';
				text.textContent = message || 'Connecting...';
			}
		}
	}
	
	function updateAuthStatus(message) {
		const authElement = document.getElementById('auth-status');
		if (authElement) {
			authElement.textContent = message;
		}
	}
	
	async function checkAuth() {
		try {
			const response = await fetch('/api/v1/auths/', { credentials: 'include' });
			
			if (response.ok) {
				const data = await response.json();
				isAuthenticated = true;
				isAdmin = data.role === 'admin';
				
				updateAuthStatus(`✅ ${data.role || 'user'} (${data.name || 'Unknown'})`);
				addLog(`Authentification réussie - Role: ${data.role}`, 'success');
				
				if (!isAdmin) {
					addLog('⚠️ ATTENTION: Accès admin requis pour cette interface', 'warning');
					updateAuthStatus('❌ Admin access required');
				}
				
				return true;
			} else {
				isAuthenticated = false;
				isAdmin = false;
				updateAuthStatus('❌ Not authenticated');
				addLog('Authentification échouée', 'error');
				return false;
			}
		} catch (e) {
			isAuthenticated = false;
			isAdmin = false;
			updateAuthStatus('❌ Auth error');
			addLog('Erreur d\'authentification: ' + e.message, 'error');
			return false;
		}
	}
	
	async function loadConfig() {
		if (!isAdmin) {
			addLog('❌ Accès admin requis pour charger la configuration', 'error');
			return;
		}
		
		addLog('📥 Chargement de la configuration API v2...');
		
		try {
			const response = await fetch('/api/v1/configs/api_v2/admin/config', { 
				credentials: 'include' 
			});
			
			if (response.ok) {
				currentConfig = await response.json();
				populateFormFields(currentConfig);
				updateConnectionStatus('connected', 'Configuration loaded');
				addLog('✅ Configuration chargée avec succès', 'success');
			} else if (response.status === 403) {
				addLog('🚫 Accès refusé - Permissions admin requises', 'error');
			} else if (response.status === 401) {
				addLog('🔒 Non autorisé - Connexion requise', 'error');
			} else {
				addLog(`❌ Erreur de chargement: ${response.status}`, 'error');
			}
		} catch (e) {
			addLog('❌ Erreur de réseau: ' + e.message, 'error');
			updateConnectionStatus('error', 'Network Error');
		}
	}
	
	function populateFormFields(config) {
		// Populate LLM Configuration
		const llmConfig = config.llm || {};
		setFieldValue('default_model', llmConfig.default_model || '');
		setFieldValue('temperature', llmConfig.temperature || 0.7);
		setFieldValue('max_tokens', llmConfig.max_tokens || 4096);
		setFieldValue('top_p', llmConfig.top_p || 0.9);
		
		// Populate System Limits
		const limits = config.system_limits || {};
		setFieldValue('rate_limit_requests', limits.rate_limit_requests || 60);
		setFieldValue('rate_limit_tokens', limits.rate_limit_tokens || 40000);
		setFieldValue('request_timeout', limits.request_timeout || 120);
		setFieldValue('retry_attempts', limits.retry_attempts || 3);
		
		// Populate Processing Features
		const features = config.processing_features || {};
		setCheckboxValue('streaming_enabled', features.streaming_enabled !== false);
		setCheckboxValue('file_processing_enabled', features.file_processing_enabled !== false);
		setCheckboxValue('web_search_enabled', features.web_search_enabled !== false);
		setCheckboxValue('memory_enabled', features.memory_enabled !== false);
		setFieldValue('max_file_size', features.max_file_size || 50);
		
		// Populate Memory Management
		const memory = config.memory_management || {};
		setFieldValue('memory_ttl', memory.ttl || 3600);
		setFieldValue('max_memory_entries', memory.max_entries || 100);
		setFieldValue('memory_cleanup_strategy', memory.cleanup_strategy || 'lru');
		
		// Populate Templates
		const templates = config.templates || {};
		setFieldValue('default_system_template', templates.default_system || '');
		setFieldValue('error_template', templates.error || '');
		
		// Update range display values
		updateRangeDisplay('temperature');
		updateRangeDisplay('top_p');
		
		addLog(' Champs du formulaire mis à jour', 'info');
	}
	
	function setFieldValue(fieldId, value) {
		const field = document.getElementById(fieldId);
		if (field) {
			field.value = value;
		}
	}
	
	function setCheckboxValue(fieldId, value) {
		const field = document.getElementById(fieldId);
		if (field) {
			field.checked = value;
		}
	}
	
	function updateRangeDisplay(fieldId) {
		const field = document.getElementById(fieldId);
		const display = document.getElementById(fieldId + '-value');
		if (field && display) {
			display.textContent = field.value;
		}
	}
	
	function getFormConfig() {
		return {
			llm: {
				default_model: document.getElementById('default_model')?.value || '',
				temperature: parseFloat(document.getElementById('temperature')?.value || 0.7),
				max_tokens: parseInt(document.getElementById('max_tokens')?.value || 4096),
				top_p: parseFloat(document.getElementById('top_p')?.value || 0.9)
			},
			system_limits: {
				rate_limit_requests: parseInt(document.getElementById('rate_limit_requests')?.value || 60),
				rate_limit_tokens: parseInt(document.getElementById('rate_limit_tokens')?.value || 40000),
				request_timeout: parseInt(document.getElementById('request_timeout')?.value || 120),
				retry_attempts: parseInt(document.getElementById('retry_attempts')?.value || 3)
			},
			processing_features: {
				streaming_enabled: document.getElementById('streaming_enabled')?.checked || false,
				file_processing_enabled: document.getElementById('file_processing_enabled')?.checked || false,
				web_search_enabled: document.getElementById('web_search_enabled')?.checked || false,
				memory_enabled: document.getElementById('memory_enabled')?.checked || false,
				max_file_size: parseInt(document.getElementById('max_file_size')?.value || 50)
			},
			memory_management: {
				ttl: parseInt(document.getElementById('memory_ttl')?.value || 3600),
				max_entries: parseInt(document.getElementById('max_memory_entries')?.value || 100),
				cleanup_strategy: document.getElementById('memory_cleanup_strategy')?.value || 'lru'
			},
			templates: {
				default_system: document.getElementById('default_system_template')?.value || '',
				error: document.getElementById('error_template')?.value || ''
			}
		};
	}
	
	async function saveConfig() {
		if (!isAdmin) {
			addLog('❌ Accès admin requis pour sauvegarder', 'error');
			return;
		}
		
		const newConfig = getFormConfig();
		addLog(' Sauvegarde de la configuration...');
		
		try {
			const response = await fetch('/api/v1/configs/api_v2/admin/config', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					config: newConfig,
					reason: 'Interface admin update',
					backup_current: true
				})
			});
			
			if (response.ok) {
				currentConfig = await response.json();
				addLog('✅ Configuration sauvegardée avec succès', 'success');
				updateConnectionStatus('connected', 'Saved successfully');
			} else {
				const error = await response.text();
				addLog(`❌ Erreur de sauvegarde: ${response.status} - ${error}`, 'error');
			}
		} catch (e) {
			addLog('❌ Erreur de réseau lors de la sauvegarde: ' + e.message, 'error');
		}
	}
	
	// Make functions globally available
	window.loadConfig = loadConfig;
	window.saveConfig = saveConfig;
	
	// Initialize when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initializeInterface);
	} else {
		initializeInterface();
	}
	
	async function initializeInterface() {
		addLog('🚀 Interface d\'administration API v2 initialisée');
		
		// Check authentication first
		updateConnectionStatus('loading', 'Checking authentication...');
		const authOk = await checkAuth();
		
		if (authOk && isAdmin) {
			// Load current configuration
			await loadConfig();
		} else {
			updateConnectionStatus('error', 'Admin access required');
		}
		
		// Setup range value updates
		const rangeInputs = ['temperature', 'top_p'];
		rangeInputs.forEach(id => {
			const input = document.getElementById(id);
			if (input) {
				input.addEventListener('input', () => updateRangeDisplay(id));
			}
		});
		
		addLog('📋 Interface prête - ' + (isAdmin ? 'Mode administrateur' : 'Accès limité'));
	}
</script>


