<template>
<MkStickyContainer>
	<template #header>
		<MkPageHeader :actions="headerActions" :tabs="headerTabs"/>
	</template>
	<div style="overflow: clip;">
		<MkSpacer :content-max="600" :margin-min="20">
			<div class="_gaps_m">
				<p>{{ i18n.t('supporterDescription', { name: instance.name ?? host }) }}</p>
				<FormSection :first="true">
					<template #label>
						<Mfm text="$[jelly ❤]"/> {{ i18n.ts.supporterListTitle }}
					</template>
					<div :class="$style.supportersWithIcon">
						<MkA v-for="supporter in supporterNameWithIcon" :key="supporter.username" :class="$style.supporterWithIcon" :to="userPage({ username: supporter.username, host: null })">
							<img :class="$style.supporterIcon" :src="supporter.avatarUrl" decoding="async"/>
							<Mfm :class="$style.supporterName" :text="supporter.name" :plain="true" :nowrap="true"/>
						</MkA>
					</div>
					<div style="margin-top: 16px; display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); grid-gap: 12px;">
						<div v-for="supporter in supporterName" :key="supporter.username">
							<MkA :class="$style.name" :to="userPage({ username: supporter.username, host: null })"><Mfm :class="$style.supporterName" :text="supporter.name" :plain="true" :nowrap="true"/></MkA>
						</div>
					</div>
					<p>{{ i18n.ts.moreSupporters }}</p>
				</FormSection>
			</div>
		</MkSpacer>
	</div>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import FormSection from '@/components/form/section.vue';
import { i18n } from '@/i18n';
import { host } from '@/config';
import * as os from '@/os';
import { instance } from '@/instance';
import { userPage } from '@/filters/user';
import { definePageMetadata } from '@/scripts/page-metadata';

 type SupporterUser = {
	username: string,
	name: string,
	avatarUrl: string,
	type: 'name' | 'nameWithIcon'
}

let supporterName = $ref<SupporterUser[]>([]);
let supporterNameWithIcon = $ref<SupporterUser[]>([]);

const headerActions = $computed(() => []);
const headerTabs = $computed(() => []);

onMounted(async () => {
	const supporters = (await os.api('integrations/patreon/list')) as SupporterUser[];
	supporters.forEach(supporter => {
		if (supporter.type === 'nameWithIcon') {
			supporterNameWithIcon.push(supporter);
		} else {
			supporterName.push(supporter);
		}
	});
});

definePageMetadata({
	title: i18n.ts.supporterList,
	icon: null,
});
</script>

<style lang="scss" module>
.supportersWithIcon {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	grid-gap: 12px;
}

.supporterWithIcon {
	display: flex;
	align-items: center;
	padding: 12px;
	background: var(--buttonBg);
	border-radius: 6px;

	&:hover {
		text-decoration: none;
		background: var(--buttonHoverBg);
	}
}

.supporterIcon {
	width: 24px;
	height: 24px;
	border-radius: 100%;
}

.supporterName {
	margin-left: 12px;
}
</style>
