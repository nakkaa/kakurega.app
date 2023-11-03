<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkModalWindow
	ref="dialog"
	:width="500"
	:height="600"
	@close="dialog.close()"
	@closed="$emit('closed')"
>
	<template #header>{{ i18n.ts.signup }}</template>

	<div style="overflow-x: clip;">
		<Transition
			mode="out-in"
			:enterActiveClass="$style.transition_x_enterActive"
			:leaveActiveClass="$style.transition_x_leaveActive"
			:enterFromClass="$style.transition_x_enterFrom"
			:leaveToClass="$style.transition_x_leaveTo"
		>
			<template v-if="!isAcceptedServerRule">
				<XServerRules @done="isAcceptedServerRule = true" @cancel="dialog.close()"/>
			</template>
			<template v-else-if="!isChoosed && instance.enableRegistrationLimit">
				<XChoice @done="doneChoice" @cancel="dialog?.close()"/>
			</template>
			<template v-else>
				<XSignup :autoSet="autoSet" :withoutInviteCode="withoutInviteCode" @back="onBack" @signup="onSignup" @signupEmailPending="onSignupEmailPending"/>
			</template>
		</Transition>
	</div>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { } from 'vue';
import { $ref } from 'vue/macros';
import XSignup from '@/components/MkSignupDialog.form.vue';
import XServerRules from '@/components/MkSignupDialog.rules.vue';
import XChoice from '@/components/MkSignupDialog.choice.vue';
import MkModalWindow from '@/components/MkModalWindow.vue';
import { i18n } from '@/i18n.js';
import { instance } from '@/instance.js';

const props = withDefaults(defineProps<{
	autoSet?: boolean;
}>(), {
	autoSet: false,
});

const emit = defineEmits<{
	(ev: 'done'): void;
	(ev: 'closed'): void;
}>();

const dialog = $shallowRef<InstanceType<typeof MkModalWindow>>();

let isAcceptedServerRule = $ref(false);
let isChoosed = $ref(false);
let withoutInviteCode = $ref(true);

function doneChoice(hasInviteCode: boolean) {
	isChoosed = true;
	withoutInviteCode = !hasInviteCode;
}

function onBack() {
	if (isChoosed) {
		isChoosed = false;
	} else {
		isAcceptedServerRule = false;
	}
}

function onSignup(res) {
	emit('done', res);
	dialog.close();
}

function onSignupEmailPending() {
	dialog.close();
}
</script>

<style lang="scss" module>
.transition_x_enterActive,
.transition_x_leaveActive {
	transition: opacity 0.3s cubic-bezier(0,0,.35,1), transform 0.3s cubic-bezier(0,0,.35,1);
}
.transition_x_enterFrom {
	opacity: 0;
	transform: translateX(50px);
}
.transition_x_leaveTo {
	opacity: 0;
	transform: translateX(-50px);
}
</style>
