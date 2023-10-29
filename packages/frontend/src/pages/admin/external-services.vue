<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><XHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="700" :marginMin="16" :marginMax="32">
		<FormSuspense :p="init">
			<div class="_gaps_m">
				<FormSection first>
					<template #label>DeepL Translation</template>

					<div class="_gaps_m">
						<MkInput v-model="deeplAuthKey">
							<template #prefix><i class="ti ti-key"></i></template>
							<template #label>DeepL Auth Key</template>
						</MkInput>
						<MkSwitch v-model="deeplIsPro">
							<template #label>Pro account</template>
						</MkSwitch>
					</div>
				</FormSection>
				<FormSection>
					<template #label>Sentry logging</template>

					<div class="_gaps_m">
						<MkSwitch v-model="enableSentryLogging">
							<template #label>Enable sentry logging</template>
						</MkSwitch>
						<MkInput v-model="sentryDsn">
							<template #prefix><i class="ti ti-key"></i></template>
							<template #label>SentryDSN</template>
						</MkInput>
					</div>
				</FormSection>
			</div>
		</FormSuspense>
	</MkSpacer>
	<template #footer>
		<div :class="$style.footer">
			<MkSpacer :contentMax="700" :marginMin="16" :marginMax="16">
				<MkButton primary rounded @click="save"><i class="ti ti-check"></i> {{ i18n.ts.save }}</MkButton>
			</MkSpacer>
		</div>
	</template>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { } from 'vue';
import XHeader from './_header_.vue';
import MkInput from '@/components/MkInput.vue';
import MkButton from '@/components/MkButton.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import FormSuspense from '@/components/form/suspense.vue';
import FormSection from '@/components/form/section.vue';
import * as os from '@/os.js';
import { fetchInstance } from '@/instance.js';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';

let deeplAuthKey: string = $ref('');
let deeplIsPro: boolean = $ref(false);
let enableSentryLogging: boolean = $ref(false);
let sentryDsn: string = $ref('');

async function init() {
	const meta = await os.api('admin/meta');
	deeplAuthKey = meta.deeplAuthKey;
	deeplIsPro = meta.deeplIsPro;
	enableSentryLogging = meta.enableSentryLogging;
	sentryDsn = meta.sentryDsn;
}

function save() {
	os.apiWithDialog('admin/update-meta', {
		deeplAuthKey,
		deeplIsPro,
		enableSentryLogging,
		sentryDsn,
	}).then(() => {
		fetchInstance();
	});
}

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.externalServices,
	icon: 'ti ti-link',
});
</script>

<style lang="scss" module>
.footer {
	-webkit-backdrop-filter: var(--blur, blur(15px));
	backdrop-filter: var(--blur, blur(15px));
}
</style>
