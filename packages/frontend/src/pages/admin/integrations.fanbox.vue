<template>
	<FormSuspense :p="init">
		<div class="_gaps_m">
			<MkSwitch v-model="enableFanboxIntegration">
				<template #label>{{ i18n.ts.enable }}</template>
			</MkSwitch>

			<template v-if="enableFanboxIntegration">
				<MkInput v-model="fanboxApiBackendUrl">
					<template #prefix><i class="ti ti-link"></i></template>
					<template #label>FANBOX API Backend Host</template>
				</MkInput>
			</template>

			<MkButton primary @click="save"><i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}</MkButton>
		</div>
	</FormSuspense>
</template>

<script lang="ts" setup>
import { } from 'vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkInput from '@/components/MkInput.vue';
import MkButton from '@/components/MkButton.vue';
import FormSuspense from '@/components/form/suspense.vue';
import * as os from '@/os.js';
import { fetchInstance } from '@/instance.js';
import { i18n } from '@/i18n.js';

let uri: string = $ref('');
let enableFanboxIntegration: boolean = $ref(false);
let fanboxApiBackendUrl: string = $ref('');

async function init() {
	const meta = await os.api('admin/meta');
	uri = meta.uri;
	enableFanboxIntegration = meta.enableFanboxIntegration;
	fanboxApiBackendUrl = meta.fanboxApiBackendUrl;
}

function save() {
	os.apiWithDialog('admin/update-meta', {
		enableFanboxIntegration,
		fanboxApiBackendUrl,
	}).then(() => {
		fetchInstance();
	});
}
</script>
