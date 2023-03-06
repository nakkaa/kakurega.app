<template>
	<div class="_gaps_m">
		<FormSection v-if="instance.enablePatreonIntegration" :first="true">
			<template #label>
				<i class="ti ti-brand-patreon"></i>
				Patreon
				<span class="_beta">{{ i18n.ts.originalFeature }}</span>
			</template>
			<p v-if="integrations.patreon">{{ i18n.ts.connectedTo }}: <a href="https://www.patreon.com/home" rel="nofollow noopener" target="_blank">{{ integrations.patreon.id }}</a></p>
			<div v-if="integrations.patreon" class="_gaps_s">
				<MkButton danger @click="disconnectPatreon">{{ i18n.ts.disconnectService }}</MkButton>
				<MkButton primary @click="requestRefresh">{{ i18n.ts.requestRefresh }}</MkButton>
			</div>
			<MkButton v-else primary @click="connectPatreon">{{ i18n.ts.connectService }}</MkButton>
		</FormSection>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { apiUrl } from '@/config';
import * as os from '@/os';
import FormSection from '@/components/form/section.vue';
import MkButton from '@/components/MkButton.vue';
import { $i } from '@/account';
import { instance } from '@/instance';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

const patreonForm = ref<Window | null>(null);

const integrations = computed(() => $i!.integrations);

function openWindow(service: string, type: string) {
	return window.open(`${apiUrl}/${type}/${service}`,
		`${service}_${type}_window`,
		'height=570, width=520',
	);
}

function connectPatreon() {
	patreonForm.value = openWindow('patreon', 'connect');
}

function disconnectPatreon() {
	openWindow('patreon', 'disconnect');
}

async function requestRefresh() {
	await os.api('integrations/patreon/request-refresh');

	os.alert({
		type: 'success',
		title: i18n.ts.requestedRefresh,
		text: i18n.ts.requestedRefreshDetails,
	});
}

onMounted(() => {
	document.cookie = `igi=${$i!.token}; path=/;` +
		' max-age=31536000;' +
		(document.location.protocol.startsWith('https') ? ' secure' : '');

	watch(integrations, () => {
		if (integrations.value.patreon) {
			if (patreonForm.value) patreonForm.value.close();
		}
	});
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.integration,
	icon: 'ti ti-share',
});
</script>
