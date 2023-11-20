<template>
<div class="_gaps_m">
	<MkSwitch v-model="showWidgets">{{ i18n.ts.showWidgets }}</MkSwitch>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import MkSwitch from '@/components/MkSwitch.vue';
import { zenStore } from '@/ui/universal-zen/zen-store.js';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';

const showWidgets = computed(zenStore.makeGetterSetter('showWidgets'));

definePageMetadata({
	title: i18n.ts.zenMode,
	icon: 'ti ti-seeding',
});
</script>
