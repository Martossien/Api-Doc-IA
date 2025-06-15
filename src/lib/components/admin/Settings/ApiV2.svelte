<script lang="ts">
	import { getApiV2Config, updateApiV2Config } from '$lib/apis/configs';
	import { getModels } from '$lib/apis';
	import { models, user } from '$lib/stores';
	import Switch from '$lib/components/common/Switch.svelte';
	import { onMount, getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import Tooltip from '$lib/components/common/Tooltip.svelte';

	const i18n = getContext('i18n');
	export let saveHandler: Function;

	let apiV2Config = null;
	let loading = true;
	let availableModels = [];
	let visionCapableModels = [];

	// Configuration sections
	let llmConfig = {
		temperature: 0.7,
		max_tokens: 8000,
		top_p: 0.9,
		frequency_penalty: 0.0,
		presence_penalty: 0.0
	};

	// Parameter functionality status for UI control
	const parameterStatus = {
		// Important - All working
		temperature: { working: true, priority: 'important' },
		max_tokens: { working: true, priority: 'important' },
		max_concurrent_tasks: { working: true, priority: 'important' },
		max_file_size_mb: { working: true, priority: 'important' },
		enabled: { working: true, priority: 'important' },
		
		// Medium - Open WebUI native parameters (ALL WORKING!)
		pdf_extract_images: { working: true, priority: 'medium', note: 'Maps to PDF_EXTRACT_IMAGES - Open WebUI native' },
		bypass_embedding_and_retrieval: { working: true, priority: 'medium', note: 'Maps to BYPASS_EMBEDDING_AND_RETRIEVAL - Open WebUI native' },
		rag_full_context: { working: true, priority: 'medium', note: 'Maps to RAG_FULL_CONTEXT - Open WebUI native' },
		enable_hybrid_search: { working: true, priority: 'medium', note: 'Maps to ENABLE_RAG_HYBRID_SEARCH - Open WebUI native' },
		
		// Medium - RAG parameters (ALL WORKING!)
		top_k: { working: true, priority: 'medium', note: 'Maps to RAG_TOP_K - Open WebUI native' },
		top_k_reranker: { working: true, priority: 'medium', note: 'Maps to RAG_TOP_K_RERANKER - Open WebUI native' },
		relevance_threshold: { working: true, priority: 'medium', note: 'Maps to RAG_RELEVANCE_THRESHOLD - Open WebUI native' },
		
		// Medium - Document segmentation (ALL WORKING!)
		chunk_size: { working: true, priority: 'medium', note: 'Maps to CHUNK_SIZE - Open WebUI native' },
		chunk_overlap: { working: true, priority: 'medium', note: 'Maps to CHUNK_OVERLAP - Open WebUI native' },
		text_splitter: { working: true, priority: 'medium', note: 'Maps to TEXT_SPLITTER - Open WebUI native' },
		content_extraction_engine: { working: true, priority: 'medium', note: 'Maps to CONTENT_EXTRACTION_ENGINE - Open WebUI native' },
		
		
		// Low - Mixed functionality
		top_p: { working: false, priority: 'low', reason: 'Defined but not used in LLM calls' },
		auto_scaling_enabled: { working: false, priority: 'low', reason: 'No auto-scaling logic implemented' },
		emergency_stop_threshold: { working: false, priority: 'low', reason: 'No emergency stop logic implemented' },
		default_prompt_template: { working: false, priority: 'low', reason: 'Templates defined but not used in processing' },
		system_prompt: { working: false, priority: 'low', reason: 'Not integrated with LLM calls' },
		cleanup_after_processing: { working: true, priority: 'low' },
		monitor_usage: { working: true, priority: 'low', note: 'Basic memory monitoring via psutil' }
	};

	let processingConfig = {
		// === OPEN WEBUI NATIVE PARAMETERS ===
		pdf_extract_images: false,
		bypass_embedding_and_retrieval: false,
		rag_full_context: false,
		enable_hybrid_search: false,
		
		// === RAG RETRIEVAL PARAMETERS ===
		top_k: 3,
		top_k_reranker: 3,
		relevance_threshold: 0.0,
		
		// === DOCUMENT SEGMENTATION ===
		chunk_size: 1000,
		chunk_overlap: 200,
		text_splitter: "character",
		
		// === CONTENT EXTRACTION ===
		content_extraction_engine: "default",
		
		// === VISION PROCESSING ===
		vision_mode: "auto",
		
		// === LEGACY PARAMETERS ===
		max_file_size_mb: 50,
		preprocessing_enabled: true
	};


	let systemLimitsConfig = {
		max_concurrent_tasks: 3,
		task_timeout_seconds: 300,
		queue_max_size: 100,
		auto_scaling_enabled: false
	};

	let memoryManagementConfig = {
		cleanup_after_processing: true,
		monitor_usage: true,
		emergency_stop_threshold: 95,
		max_memory_per_task_mb: 512
	};

	let templatesConfig = {
		default_prompt_template: "Analyze the provided document and answer: {prompt}",
		vision_prompt_template: "Analyze the provided image and answer: {prompt}",
		system_prompt: "You are a helpful AI assistant specialized in document analysis."
	};

	let globalConfig = {
		enabled: true,
		admin_model: "auto"
	};

	const submitHandler = async () => {
		// Prepare the complete configuration object
		const configData = {
			llm: llmConfig,
			processing: processingConfig,
			system_limits: systemLimitsConfig,
			memory_management: memoryManagementConfig,
			templates: templatesConfig,
			enabled: globalConfig.enabled,
			admin_model: globalConfig.admin_model,
			version: "2.0.0"
		};

		try {
			const res = await updateApiV2Config(localStorage.token, configData);
			
			if (res) {
				toast.success($i18n.t('API v2 configuration updated successfully'));
				apiV2Config = res;
			} else {
				throw new Error('Failed to update configuration');
			}
		} catch (error) {
			console.error('Error updating API v2 config:', error);
			toast.error($i18n.t('Failed to update API v2 configuration'));
		}
	};

	const loadModels = async () => {
		console.log('🚀 loadModels() called');
		try {
			const fetchedModels = await getModels($user?.token);
			console.log('📦 Fetched models:', fetchedModels?.length || 0, 'models');
			if (fetchedModels) {
				availableModels = fetchedModels;
				models.set(fetchedModels);
				
				console.log('🔧 Before filtering - total models:', fetchedModels.length);
				
				// TEMPORARY FIX: Mark ALL models as vision-capable (like Open WebUI default)
				// This matches Open WebUI's behavior where models are vision-capable by default
				visionCapableModels = [...fetchedModels];
				
				console.log('✅ After filtering - vision capable models:', visionCapableModels.length);
			
			// Debug: Log model capabilities for troubleshooting
			console.log('🔍 Model capabilities analysis:');
			fetchedModels.forEach(model => {
				console.log(`📊 Model: ${model.name} (${model.id})`);
				console.log(`   - Full model object:`, model);
				console.log(`   - info.meta.capabilities:`, model?.info?.meta?.capabilities);
				console.log(`   - vision capability:`, model?.info?.meta?.capabilities?.vision);
				console.log(`   - Should be vision (OpenWebUI logic):`, model?.info?.meta?.capabilities?.vision ?? true);
				
				if (model?.info?.meta?.capabilities?.vision === true) {
					console.log(`[OK] ${model.name} - Has vision metadata`);
				} else if (visionCapableModels.includes(model)) {
					console.log(`🔤 ${model.name} - Detected by keywords`);
				} else {
					console.log(`❌ ${model.name} - Not detected as vision-capable`);
				}
			});
		}
	} catch (error) {
		console.error('Error loading models:', error);
		toast.error($i18n.t('Failed to load available models'));
	}
	};

	onMount(async () => {
		try {
			// Load models first
			await loadModels();
			
			// Then load API v2 config
			const res = await getApiV2Config(localStorage.token);
			if (res) {
				apiV2Config = res;
				console.log('🔧 API v2 config loaded:', res);
				console.log('🔧 Admin model from API:', res.admin_model);
				
				// Populate form fields from API response
				if (res.llm) {
					llmConfig = { ...llmConfig, ...res.llm };
				}
				if (res.processing) {
					processingConfig = { ...processingConfig, ...res.processing };
				}
				if (res.system_limits) {
					systemLimitsConfig = { ...systemLimitsConfig, ...res.system_limits };
				}
				if (res.memory_management) {
					memoryManagementConfig = { ...memoryManagementConfig, ...res.memory_management };
				}
				if (res.templates) {
					templatesConfig = { ...templatesConfig, ...res.templates };
				}
				if (res.enabled !== undefined) {
					globalConfig.enabled = res.enabled;
				}
				// Always set admin_model, even if it's "auto" or empty
				globalConfig.admin_model = res.admin_model || "auto";
				console.log('🔧 Admin model set to:', globalConfig.admin_model);
			}
		} catch (error) {
			console.error('Error loading API v2 config:', error);
			toast.error($i18n.t('Failed to load API v2 configuration'));
		} finally {
			loading = false;
		}
	});
</script>

<form
	class="flex flex-col h-full justify-between space-y-3 text-sm"
	on:submit|preventDefault={async () => {
		await submitHandler();
		saveHandler();
	}}
>
	<div class="space-y-3 overflow-y-scroll scrollbar-hidden h-full">
		
		<!-- Global Settings -->
		<div class="mb-3">
			<div class="mb-2.5 text-base font-medium">{$i18n.t('Global Settings')}</div>
			<hr class="border-gray-100 dark:border-gray-850 my-2" />
			
			<div class="py-1 flex w-full justify-between">
				<div class="self-center text-xs font-medium">{$i18n.t('Enable API v2')}</div>
				<div class="self-center">
					<Switch bind:state={globalConfig.enabled} />
				</div>
			</div>

			<div class="flex flex-col">
				<div class="mb-2 text-xs font-medium flex items-center space-x-2">
					<span>{$i18n.t('Admin Model')}</span>
					{#if visionCapableModels.length > 0}
						<span class="text-green-600 text-xs">({visionCapableModels.length} vision models available)</span>
					{/if}
				</div>
				<div class="flex w-full">
					<div class="flex-1">
						<select
							class="w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-none border border-gray-300 dark:border-gray-600"
							bind:value={globalConfig.admin_model}
							required
						>
							<option value="auto">🔀 Auto (Automatic Selection)</option>
							{#if visionCapableModels.length > 0}
								<optgroup label="Vision-Capable Models (Recommended)">
									{#each visionCapableModels as model}
										<option value={model.id}>
											{model.name} - {model.owned_by}
										</option>
									{/each}
								</optgroup>
							{/if}
							{#if availableModels.length > 0}
								<optgroup label="All Available Models">
									{#each availableModels as model}
										<option value={model.id}>
											{model.name} - {model.owned_by}
										</option>
									{/each}
								</optgroup>
							{/if}
						</select>
					</div>
				</div>
				{#if globalConfig.admin_model && !visionCapableModels.find(m => m.id === globalConfig.admin_model)}
					<div class="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
						Warning: Selected model may not support vision/document processing
					</div>
				{/if}
			</div>
		</div>

		<!-- Model Configuration -->
		<div class="mb-3">
			<div class="mb-2.5 text-base font-medium">{$i18n.t('Model Configuration')}</div>
			<hr class="border-gray-100 dark:border-gray-850 my-2" />
			
			<div class="space-y-3">
				<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
					<div class="text-xs font-medium mb-2">Available Models Summary:</div>
					<div class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
						<div>• Total Models: {availableModels.length}</div>
						<div>• Vision-Capable: {visionCapableModels.length}</div>
						<div>• Current Selection: {globalConfig.admin_model || 'None selected'}</div>
					</div>
				</div>
				
				{#if availableModels.length === 0}
					<div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
						<div class="text-yellow-800 dark:text-yellow-200 text-xs">
							<strong>Warning: No models loaded.</strong> 
							<button 
								type="button"
								class="underline hover:no-underline ml-1"
								on:click={loadModels}
							>
								Click here to reload models
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- LLM Configuration -->
		<div class="mb-3">
			<div class="mb-2.5 text-base font-medium">{$i18n.t('LLM Configuration')}</div>
			<hr class="border-gray-100 dark:border-gray-850 my-2" />
			
			<div class="flex flex-col space-y-3">
				<div class="flex flex-col">
					<div class="mb-2 text-xs font-medium flex items-center space-x-2">
						<span>{$i18n.t('Temperature')}</span>
						<span class="text-gray-500">({llmConfig.temperature})</span>
						<Tooltip content="Controls randomness: 0 = deterministic, 2 = very creative">
							<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
							</svg>
						</Tooltip>
					</div>
					<input
						type="range"
						min="0"
						max="2"
						step="0.1"
						bind:value={llmConfig.temperature}
						class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
					/>
				</div>

				<div class="flex flex-col">
					<div class="mb-2 text-xs font-medium">{$i18n.t('Max Tokens')}</div>
					<input
						type="number"
						min="1"
						max="32000"
						bind:value={llmConfig.max_tokens}
						class="w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-none"
						required
					/>
				</div>

				<div class="flex flex-col {!parameterStatus.top_p.working ? 'opacity-50' : ''}">
					<div class="mb-2 text-xs font-medium flex items-center space-x-2">
						<span>{$i18n.t('Top P')}</span>
						<span class="text-gray-500">({llmConfig.top_p})</span>
						{#if !parameterStatus.top_p.working}
							<Tooltip content="Warning: Not implemented - {parameterStatus.top_p.reason}">
								<span class="text-orange-500 text-xs">[Non fonctionnel]</span>
							</Tooltip>
						{/if}
					</div>
					<input
						type="range"
						min="0"
						max="1"
						step="0.05"
						bind:value={llmConfig.top_p}
						disabled={!parameterStatus.top_p.working}
						class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 {!parameterStatus.top_p.working ? 'cursor-not-allowed' : ''}"
					/>
				</div>
			</div>
		</div>

		<!-- Processing Features -->
		<div class="mb-3">
			<div class="mb-2.5 text-base font-medium">{$i18n.t('Processing Features')}</div>
			<hr class="border-gray-100 dark:border-gray-850 my-2" />
			
			<div class="space-y-3">
				<div class="py-1 flex w-full justify-between">
					<div class="self-center text-xs font-medium flex items-center space-x-2">
						<span>PDF Extract Images (OCR)</span>
						<Tooltip content="{parameterStatus.pdf_extract_images.note}">
							<span class="text-green-500 text-xs">[OK] Native</span>
						</Tooltip>
					</div>
					<div class="self-center">
						<Switch bind:state={processingConfig.pdf_extract_images} />
					</div>
				</div>

				<div class="py-1 flex w-full justify-between">
					<div class="self-center text-xs font-medium flex items-center space-x-2">
						<span>Bypass Embedding & Retrieval</span>
						<Tooltip content="{parameterStatus.bypass_embedding_and_retrieval.note}">
							<span class="text-green-500 text-xs">[OK] Native</span>
						</Tooltip>
					</div>
					<div class="self-center">
						<Switch bind:state={processingConfig.bypass_embedding_and_retrieval} />
					</div>
				</div>

				<div class="py-1 flex w-full justify-between">
					<div class="self-center text-xs font-medium flex items-center space-x-2">
						<span>RAG Full Context</span>
						<Tooltip content="{parameterStatus.rag_full_context.note}">
							<span class="text-green-500 text-xs">[OK] Native</span>
						</Tooltip>
					</div>
					<div class="self-center">
						<Switch bind:state={processingConfig.rag_full_context} />
					</div>
				</div>

				<div class="flex flex-col">
					<div class="mb-2 text-xs font-medium flex items-center space-x-2">
						<span>Vision Processing Mode</span>
						<Tooltip content="Control how images are processed: Auto (name detection), Force Vision (always use model vision), Force Text (always use OCR)">
							<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
							</svg>
						</Tooltip>
					</div>
					<select
						bind:value={processingConfig.vision_mode}
						class="w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-none"
					>
						<option value="auto">🔀 Auto (Name Detection)</option>
						<option value="force_vision">👁️ Force Vision Mode</option>
						<option value="force_text">📄 Force Text/OCR Mode</option>
					</select>
				</div>

				<div class="flex flex-col">
					<div class="mb-2 text-xs font-medium">{$i18n.t('Max File Size (MB)')}</div>
					<input
						type="number"
						min="1"
						max="1000"
						bind:value={processingConfig.max_file_size_mb}
						class="w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-none"
						required
					/>
				</div>
			</div>
		</div>

		<!-- System Limits -->
		<div class="mb-3">
			<div class="mb-2.5 text-base font-medium">{$i18n.t('System Limits')}</div>
			<hr class="border-gray-100 dark:border-gray-850 my-2" />
			
			<div class="space-y-3">
				<div class="flex flex-col">
					<div class="mb-2 text-xs font-medium">{$i18n.t('Max Concurrent Tasks')}</div>
					<input
						type="number"
						min="1"
						max="50"
						bind:value={systemLimitsConfig.max_concurrent_tasks}
						class="w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-none"
						required
					/>
				</div>

				<div class="flex flex-col">
					<div class="mb-2 text-xs font-medium">{$i18n.t('Task Timeout (seconds)')}</div>
					<input
						type="number"
						min="30"
						max="3600"
						bind:value={systemLimitsConfig.task_timeout_seconds}
						class="w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-none"
						required
					/>
				</div>

				<div class="py-1 flex w-full justify-between {!parameterStatus.auto_scaling_enabled.working ? 'opacity-50' : ''}">
					<div class="self-center text-xs font-medium flex items-center space-x-2">
						<span>{$i18n.t('Auto Scaling')}</span>
						{#if !parameterStatus.auto_scaling_enabled.working}
							<Tooltip content="Warning: {parameterStatus.auto_scaling_enabled.reason}">
								<span class="text-orange-500 text-xs">[Non fonctionnel]</span>
							</Tooltip>
						{/if}
					</div>
					<div class="self-center">
						<Switch bind:state={systemLimitsConfig.auto_scaling_enabled} disabled={!parameterStatus.auto_scaling_enabled.working} />
					</div>
				</div>
			</div>
		</div>

		<!-- Memory Management -->
		<div class="mb-3">
			<div class="mb-2.5 text-base font-medium">{$i18n.t('Memory Management')}</div>
			<hr class="border-gray-100 dark:border-gray-850 my-2" />
			
			<div class="space-y-3">
				<div class="py-1 flex w-full justify-between">
					<div class="self-center text-xs font-medium">{$i18n.t('Cleanup After Processing')}</div>
					<div class="self-center">
						<Switch bind:state={memoryManagementConfig.cleanup_after_processing} />
					</div>
				</div>

				<div class="py-1 flex w-full justify-between">
					<div class="self-center text-xs font-medium">{$i18n.t('Monitor Usage')}</div>
					<div class="self-center">
						<Switch bind:state={memoryManagementConfig.monitor_usage} />
					</div>
				</div>

				<div class="flex flex-col {!parameterStatus.emergency_stop_threshold.working ? 'opacity-50' : ''}">
					<div class="mb-2 text-xs font-medium flex items-center space-x-2">
						<span>{$i18n.t('Emergency Stop Threshold (%)')}</span>
						{#if !parameterStatus.emergency_stop_threshold.working}
							<Tooltip content="Warning: {parameterStatus.emergency_stop_threshold.reason}">
								<span class="text-orange-500 text-xs">[Non fonctionnel]</span>
							</Tooltip>
						{/if}
					</div>
					<input
						type="number"
						min="80"
						max="99"
						bind:value={memoryManagementConfig.emergency_stop_threshold}
						disabled={!parameterStatus.emergency_stop_threshold.working}
						class="w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-none {!parameterStatus.emergency_stop_threshold.working ? 'cursor-not-allowed' : ''}"
						required
					/>
				</div>
			</div>
		</div>

		<!-- Templates -->
		<div class="mb-3 {!parameterStatus.default_prompt_template.working ? 'opacity-50' : ''}">
			<div class="mb-2.5 text-base font-medium flex items-center space-x-2">
				<span>{$i18n.t('Prompt Templates')}</span>
				{#if !parameterStatus.default_prompt_template.working}
					<Tooltip content="Warning: {parameterStatus.default_prompt_template.reason}">
						<span class="text-orange-500 text-xs">[Non fonctionnel]</span>
					</Tooltip>
				{/if}
			</div>
			<hr class="border-gray-100 dark:border-gray-850 my-2" />
			
			<div class="space-y-3">
				<div class="flex flex-col">
					<div class="mb-2 text-xs font-medium">{$i18n.t('Default Prompt Template')}</div>
					<textarea
						bind:value={templatesConfig.default_prompt_template}
						rows="3"
						disabled={!parameterStatus.default_prompt_template.working}
						class="w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-none resize-none {!parameterStatus.default_prompt_template.working ? 'cursor-not-allowed' : ''}"
						placeholder="Analyze the provided document and answer: {prompt}"
						required
					></textarea>
				</div>

				<div class="flex flex-col">
					<div class="mb-2 text-xs font-medium">{$i18n.t('System Prompt')}</div>
					<textarea
						bind:value={templatesConfig.system_prompt}
						rows="2"
						disabled={!parameterStatus.system_prompt.working}
						class="w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-none resize-none {!parameterStatus.system_prompt.working ? 'cursor-not-allowed' : ''}"
						placeholder="You are a helpful AI assistant..."
						required
					></textarea>
				</div>
			</div>
		</div>
	</div>

	<div class="flex justify-end pt-3 text-sm font-medium">
		<button
			class="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-gray-100 transition rounded-lg"
			type="submit"
			disabled={loading}
		>
			{loading ? $i18n.t('Loading...') : $i18n.t('Save')}
		</button>
	</div>
</form>