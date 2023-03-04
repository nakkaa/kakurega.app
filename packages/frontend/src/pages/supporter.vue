<template>
<MkStickyContainer>
	<template #header>
		<MkPageHeader :actions="headerActions" :tabs="headerTabs"/>
	</template>
	<div style="overflow: clip;">
		<MkSpacer :content-max="600" :margin-min="20">
			<div class="_gaps_m">
				<p>{{ i18n.t('supporterDescription', { name: $instance.name ?? host }) }}</p>
				<FormSection :first="true">
					<template #label>
						<Mfm text="$[jelly ❤]"/> {{ i18n.ts.supporterListTitle }}
					</template>
					<div :class="$style.supportersWithIcon">
						<div v-for="supporter in supporterNameWithIcon" :class="$style.supporterWithIcon">
							<ImgWithBlurhash :class="$style.supporterIcon" :hash="supporter.avatarBlurhash ?? undefined" :src="supporter.avatarUrl"/>
							<Mfm :class="$style.supporterName" :text="supporter.name" :plain="true" :nowrap="true"/>
						</div>
					</div>
					<div style="margin-top: 16px; display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); grid-gap: 12px;">
						<div v-for="supporter in supporterName" :key="supporter"><Mfm :class="$style.supporterName" :text="supporter" :plain="true" :nowrap="true"/></div>
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
import ImgWithBlurhash from '@/components/MkImgWithBlurhash.vue';
import FormSection from '@/components/form/section.vue';
import { i18n } from '@/i18n';
import { host } from '@/config';
import * as os from '@/os';
import { definePageMetadata } from '@/scripts/page-metadata';

 type SupporterUser = {
	name: string,
	avatarUrl: string,
	avatarBlurhash: string | null,
	type: 'name' | 'nameWithIcon'
}

let supporterName = $ref<string[]>([]);
let supporterNameWithIcon = $ref<SupporterUser[]>([]);

const headerActions = $computed(() => []);
const headerTabs = $computed(() => []);

onMounted(async () => {
	const supporters = (await os.api('integrations/patreon/list')) as SupporterUser[];
	supporters.forEach(supporter => {
		if (supporter.type === 'nameWithIcon') {
			supporterNameWithIcon.push(supporter);
		} else {
			supporterName.push(supporter.name);
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
}

.supporterIcon {
	width: 24px;

	> * {
		border-radius: 100%;
	}
}

.supporterName {
	margin-left: 12px;
}
</style>
