<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :content-max="700">
		<div v-if="tab === 'featured'">
			<MkPagination v-slot="{items}" :pagination="featuredPagination">
				<MkChannelPreview v-for="channel in items" :key="channel.id" class="_margin" :channel="channel"/>
			</MkPagination>
		</div>
		<div v-else-if="tab === 'list'">
			<MkFoldableSection :expanded="false">
				<template #header>{{ i18n.ts.search }}</template>
				<div class="_gaps_m search-form">
					<MkInput v-model="searchQuery" :large="true" type="search">
						<template #label>{{ i18n.ts.channelSearch }}</template>
						<template #prefix><i class="ti ti-search"></i></template>
					</MkInput>
					<MkSelect v-model="sortType">
						<template #label>{{ i18n.ts.sort }}</template>
						<option v-for="x in sortOptions" :key="x.value" :value="x.value">{{ x.displayName }}</option>
					</MkSelect>
					<MkCheckbox v-model="excludeNonActiveChannels" :large="true">
						<template #label>{{ i18n.ts.excludeNonActiveChannels }}</template>
					</MkCheckbox>
				</div>
			</MkFoldableSection>
			<MkPagination v-slot="{ items }" :pagination="listPagination">
				<MkChannelPreview v-for="channel in items" :key="channel.id" class="_margin" :channel="channel"/>
			</MkPagination>
		</div>
		<div v-else-if="tab === 'favorites'">
			<MkPagination v-slot="{items}" :pagination="favoritesPagination">
				<MkChannelPreview v-for="channel in items" :key="channel.id" class="_margin" :channel="channel"/>
			</MkPagination>
		</div>
		<div v-else-if="tab === 'following'">
			<MkPagination v-slot="{items}" :pagination="followingPagination">
				<MkChannelPreview v-for="channel in items" :key="channel.id" class="_margin" :channel="channel"/>
			</MkPagination>
		</div>
		<div v-else-if="tab === 'owned'">
			<MkButton class="new" @click="create()"><i class="ti ti-plus"></i></MkButton>
			<MkPagination v-slot="{items}" :pagination="ownedPagination">
				<MkChannelPreview v-for="channel in items" :key="channel.id" class="_margin" :channel="channel"/>
			</MkPagination>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import MkChannelPreview from '@/components/MkChannelPreview.vue';
import MkPagination from '@/components/MkPagination.vue';
import MkButton from '@/components/MkButton.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkInput from '@/components/MkInput.vue';
import MkCheckbox from '@/components/MkCheckbox.vue';
import MkFoldableSection from '@/components/MkFoldableSection.vue';
import { useRouter } from '@/router';
import { definePageMetadata } from '@/scripts/page-metadata';
import { i18n } from '@/i18n';

const router = useRouter();

let tab = $ref('featured');
let sortType = ref('+notesCount');
let tempSearchQuery = ref('');
let searchQuery = ref('');
let excludeNonActiveChannels = ref(false);

const featuredPagination = {
	endpoint: 'channels/featured' as const,
	noPaging: true,
};
const listPagination = {
	endpoint: 'channels/list' as const,
	limit: 10,
	offsetMode: true,
	params: computed(() => ({
		sort: sortType.value,
		search: searchQuery.value,
		excludeNonActiveChannels: excludeNonActiveChannels.value,
	})),
};
const favoritesPagination = {
	endpoint: 'channels/my-favorites' as const,
	limit: 100,
	noPaging: true,
};
const followingPagination = {
	endpoint: 'channels/followed' as const,
	limit: 10,
};
const ownedPagination = {
	endpoint: 'channels/owned' as const,
	limit: 10,
};

const sortOptions = [
	{ value: '+notesCount', displayName: i18n.ts._sortType.notesCountDesc },
	{ value: '-notesCount', displayName: i18n.ts._sortType.notesCountAsc },
	{ value: '+usersCount', displayName: i18n.ts._sortType.usersCountDesc },
	{ value: '-usersCount', displayName: i18n.ts._sortType.usersCountAsc },
	{ value: '+lastNotedAt', displayName: i18n.ts._sortType.lastNotedAtDesc },
	{ value: '-lastNotedAt', displayName: i18n.ts._sortType.lastNotedAtAsc },
	{ value: '+name', displayName: i18n.ts._sortType.nameDesc },
	{ value: '-name', displayName: i18n.ts._sortType.nameAsc },
];

function create() {
	router.push('/channels/new');
}

const headerActions = $computed(() => [{
	icon: 'ti ti-plus',
	text: i18n.ts.create,
	handler: create,
}]);

const headerTabs = $computed(() => [{
	key: 'featured',
	title: i18n.ts._channel.featured,
	icon: 'ti ti-comet',
}, {
	key: 'list',
	title: i18n.ts._channel.list,
	icon: 'ti ti-list',
}, {
	key: 'favorites',
	title: i18n.ts.favorites,
	icon: 'ti ti-star',
}, {
	key: 'following',
	title: i18n.ts._channel.following,
	icon: 'ti ti-eye',
}, {
	key: 'owned',
	title: i18n.ts._channel.owned,
	icon: 'ti ti-edit',
}]);

definePageMetadata(computed(() => ({
	title: i18n.ts.channel,
	icon: 'ti ti-device-tv',
})));
</script>

<style lang="scss" scoped>
.search-form {
	padding: 12px 0;
}
</style>
