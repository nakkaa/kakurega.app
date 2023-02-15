<template>
	<FormSuspense :p="init">
		<div class="_gaps_m">
			<MkSwitch v-model="enablePatreonIntegration">
				<template #label>{{ i18n.ts.enable }}</template>
			</MkSwitch>

			<template v-if="enablePatreonIntegration">
				<FormInfo>Callback URL: {{ `${uri}/api/pr/cb` }}</FormInfo>

				<MkInput v-model="patreonClientId">
					<template #prefix><i class="ti ti-key"></i></template>
					<template #label>Client ID</template>
				</MkInput>

				<MkInput v-model="patreonClientSecret">
					<template #prefix><i class="ti ti-key"></i></template>
					<template #label>Client Secret</template>
				</MkInput>

				<MkInput v-model="patreonAccessToken">
					<template #prefix><i class="ti ti-key"></i></template>
					<template #label>Creator's access token</template>
				</MkInput>

				<MkInput v-model="patreonRefreshToken">
					<template #prefix><i class="ti ti-key"></i></template>
					<template #label>Creator's refresh token</template>
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
import FormInfo from '@/components/MkInfo.vue';
import FormSuspense from '@/components/form/suspense.vue';
import * as os from '@/os';
import { fetchInstance } from '@/instance';
import { i18n } from '@/i18n';

let uri: string = $ref('');
let enablePatreonIntegration: boolean = $ref(false);
let patreonClientId: string | null = $ref(null);
let patreonClientSecret: string | null = $ref(null);
let patreonAccessToken: string | null = $ref(null);
let patreonRefreshToken: string | null = $ref(null);

async function init() {
	const meta = await os.api('admin/meta');
	uri = meta.uri;
	enablePatreonIntegration = meta.enablePatreonIntegration;
	patreonClientId = meta.patreonClientId;
	patreonClientSecret = meta.patreonClientSecret;
	patreonAccessToken = meta.patreonAccessToken;
	patreonRefreshToken = meta.patreonRefreshToken;
}

function save() {
	os.apiWithDialog('admin/update-meta', {
		enablePatreonIntegration,
		patreonClientId,
		patreonClientSecret,
		patreonAccessToken,
		patreonRefreshToken,
	}).then(() => {
		fetchInstance();
	});
}
</script>
