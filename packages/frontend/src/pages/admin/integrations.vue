<template>
<MkStickyContainer>
	<template #header>
		<MkPageHeader :actions="headerActions" :tabs="headerTabs"/>
	</template>
	<MkSpacer :content-max="700" :margin-min="16" :margin-max="32">
		<FormSuspense :p="init">
			<div class="_gaps_m">
				<MkFolder>
					<template #icon><i class="ti ti-brand-patreon"></i></template>
					<template #label>Patreon</template>
					<template #suffix>{{ enablePatreonIntegration? i18n.ts.enabled : i18n.ts.disabled }}</template>
					<XPatreon/>
				</MkFolder>
			</div>
		</FormSuspense>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { } from 'vue';
import XPatreon from './integrations.patreon.vue';
import FormSuspense from '@/components/form/suspense.vue';
import MkFolder from '@/components/MkFolder.vue';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

let enablePatreonIntegration: boolean = $ref(false);

async function init() {
	const meta = await os.api('admin/meta');
	enablePatreonIntegration = meta.enablePatreonIntegration;
}

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.integration,
	icon: 'ti ti-share',
});
</script>
