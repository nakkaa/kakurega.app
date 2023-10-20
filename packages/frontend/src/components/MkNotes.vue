<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkPagination ref="pagingComponent" :pagination="pagination" :disableAutoLoad="disableAutoLoad" :suppressInfinityFetch="isNeedSuppressInfinityFetch()">
	<template #empty>
		<div class="_fullinfo">
			<img :src="infoImageUrl" class="_ghost"/>
			<div>{{ i18n.ts.noNotes }}</div>
		</div>
	</template>

	<template #default="{ items: notes }">
		<div :class="[$style.root, { [$style.noGap]: noGap }]">
			<MkDateSeparatedList
				ref="notes"
				v-slot="{ item: note }"
				:items="notes"
				:direction="pagination.reversed ? 'up' : 'down'"
				:reversed="pagination.reversed"
				:noGap="noGap"
				:ad="true"
				:class="$style.notes"
			>
				<MkNote v-if="!isFilteredNote(note)" :key="note._featuredId_ || note._prId_ || note.id" :class="$style.note" :note="note"/>
			</MkDateSeparatedList>
		</div>
	</template>
</MkPagination>
</template>

<script lang="ts" setup>
import { shallowRef } from 'vue';
import * as Misskey from 'misskey-js';
import MkNote from '@/components/MkNote.vue';
import MkDateSeparatedList from '@/components/MkDateSeparatedList.vue';
import MkPagination, { Paging } from '@/components/MkPagination.vue';
import { i18n } from '@/i18n.js';
import { infoImageUrl } from '@/instance.js';

export type Filter = {
	includeKeywords?: string[];
	includeKeywordsAll?: string[];
	excludeKeywords?: string[];
	includeInstances?: string[];
	excludeInstances?: string[];
	excludeRenotes?: boolean;
	excludeReplies?: boolean;
	mediaOnly?: boolean;
}

const props = defineProps<{
	pagination: Paging;
	noGap?: boolean;
	filter?: Filter;
	disableAutoLoad?: boolean;
}>();

const pagingComponent = shallowRef<InstanceType<typeof MkPagination>>();

const isNeedSuppressInfinityFetch = () => {
	return props.filter && Object.values(props.filter).some(x => x);
};

const isFilteredNote = (note: Misskey.entities.Note) => {
	if (!props.filter) return false;
	const filter = props.filter;

	if (filter.excludeRenotes && note.renote) return true;
	if (filter.excludeReplies && note.reply) return true;
	if (filter.mediaOnly && !note.fileIds?.length && !note.renote?.fileIds?.length) return true;

	if (filter.excludeInstances?.some(instance => note.user.host === instance)) return true;
	if (filter.includeInstances && !filter.includeInstances.some(instance => note.user.host === instance)) return true;

	if (filter.excludeKeywords?.some(keyword => note.text?.includes(keyword))) return true;
	if (filter.includeKeywords && !filter.includeKeywords.some(keyword => note.text?.includes(keyword))) return true;
	if (filter.includeKeywordsAll && !filter.includeKeywordsAll.every(keyword => note.text?.includes(keyword))) return true;

	return false;
};

defineExpose({
	pagingComponent,
});
</script>

<style lang="scss" module>
.root {
	&.noGap {
		> .notes {
			background: var(--panel);
		}
	}

	&:not(.noGap) {
		> .notes {
			background: var(--bg);

			.note {
				background: var(--panel);
				border-radius: var(--radius);
			}
		}
	}
}
</style>
