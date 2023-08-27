<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<MkInfo>{{ i18n.ts._instanceMute.title }}</MkInfo>
	<MkTextarea v-model="instanceMutes">
		<template #label>{{ i18n.ts._instanceMute.heading }}</template>
		<template #caption>{{ i18n.ts._instanceMute.instanceMuteDescription }}<br>{{ i18n.ts._instanceMute.instanceMuteDescription2 }}</template>
	</MkTextarea>
	<MkTextarea v-model="instanceMutesGtl">
		<template #label>{{ i18n.ts._instanceMuteGtl.heading }}<span class="_beta">{{ i18n.ts.originalFeature }}</span></template>
		<template #caption>{{ i18n.ts._instanceMuteGtl.instanceMuteDescription }}<br>{{ i18n.ts._instanceMute.instanceMuteDescription }}<br>{{ i18n.ts._instanceMute.instanceMuteDescription2 }}</template>
	</MkTextarea>
	<MkButton primary :disabled="!changed" @click="save()"><i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}</MkButton>
</div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import MkTextarea from '@/components/MkTextarea.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os';
import { $i } from '@/account';
import { defaultStore } from '@/store';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

const instanceMutes = ref($i!.mutedInstances.join('\n'));
const changed = ref(false);
const instanceMutesGtl = ref(defaultStore.state.mutedInstancesGtl.join('\n'));
let changedInstanceMutes = false;
let changedInstanceMutesGtl = false;

async function save() {
	if (changedInstanceMutes) {
		let mutes = instanceMutes.value
			.trim().split('\n')
			.map(el => el.trim())
			.filter(el => el);

		await os.api('i/update', {
			mutedInstances: mutes,
		});

		// Refresh filtered list to signal to the user how they've been saved
		instanceMutes.value = mutes.join('\n');
	}

	if (changedInstanceMutesGtl) {
		let mutesGtl = instanceMutesGtl.value
			.trim().split('\n')
			.map(el => el.trim())
			.filter(el => el);

		defaultStore.set('mutedInstancesGtl', mutesGtl);
	}

	changedInstanceMutes = false;
	changedInstanceMutesGtl = false;
	changed.value = false;
}

watch(instanceMutes, () => {
	changedInstanceMutes = true;
	changed.value = true;
});

watch(instanceMutesGtl, () => {
	changedInstanceMutesGtl = true;
	changed.value = true;
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.instanceMute,
	icon: 'ti ti-planet-off',
});
</script>
