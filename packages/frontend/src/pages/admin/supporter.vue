<template>
<MkStickyContainer>
	<template #header>
		<XHeader :tabs="headerTabs"/>
	</template>
	<MkSpacer :content-max="700" :margin-min="16" :margin-max="32">
		<FormSuspense :p="init">
			<div class="_gaps_m">
				<MkSwitch v-model="enableSupporterPage">{{ i18n.ts.enableSupporterPage }}</MkSwitch>

				<template v-if="enableSupporterPage">
					<MkTextarea v-model="supporterRoles">
						<template #label>{{ i18n.ts.supporterRoles }}</template>
						<template #caption>{{ i18n.ts.supporterRolesDescription }}</template>
					</MkTextarea>

					<MkInput v-model="supporterNameThreshold" type="number">
						<template #label>{{ i18n.ts.supporterNameThreshold }}</template>
						<template #caption>{{ i18n.ts.supporterNameThresholdDescription }}</template>
					</MkInput>

					<MkInput v-model="supporterNameWithIconThreshold" type="number">
						<template #label>{{ i18n.ts.supporterNameWithIconThreshold }}</template>
						<template #caption>{{ i18n.ts.supporterNameWithIconThresholdDescription }}</template>
					</MkInput>
				</template>
			</div>
		</FormSuspense>
	</MkSpacer>
	<template #footer>
		<div :class="$style.footer">
			<MkSpacer :content-max="700" :margin-min="16" :margin-max="16">
				<MkButton primary rounded @click="save"><i class="ti ti-check"></i> {{ i18n.ts.save }}</MkButton>
			</MkSpacer>
		</div>
	</template>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { } from 'vue';
import XHeader from './_header_.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkInput from '@/components/MkInput.vue';
import MkButton from '@/components/MkButton.vue';
import MkTextarea from '@/components/MkTextarea.vue';
import FormSuspense from '@/components/form/suspense.vue';
import * as os from '@/os';
import { fetchInstance } from '@/instance';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

let enableSupporterPage: boolean = $ref(false);
let supporterRoles: string = $ref('');
let supporterNameThreshold: number | null = $ref(null);
let supporterNameWithIconThreshold: number | null = $ref(null);

async function init() {
	const meta = await os.api('admin/meta');
	enableSupporterPage = meta.enableSupporterPage;
	supporterRoles = meta.supporterRoles.join('\n');
	supporterNameThreshold = meta.supporterNameThreshold;
	supporterNameWithIconThreshold = meta.supporterNameWithIconThreshold;
}

function save() {
	os.apiWithDialog('admin/update-meta', {
		enableSupporterPage,
		supporterRoles: supporterRoles.split('\n'),
		supporterNameThreshold,
		supporterNameWithIconThreshold,
	}).then(() => {
		fetchInstance();
	});
}

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.supporter,
	icon: 'ti ti-cash',
});
</script>

<style lang="scss" module>
.footer {
	-webkit-backdrop-filter: var(--blur, blur(15px));
	backdrop-filter: var(--blur, blur(15px));
}
</style>
