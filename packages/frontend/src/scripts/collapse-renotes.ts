import { defaultStore } from '@/store';

const seenNotes: string[] = [];

export function checkCollapseRenote(note: Record<string, any>, me: Record<string, any> | null | undefined): boolean {
	if (!defaultStore.state.collapseRenotes) return false;

	switch (defaultStore.state.collapseRenotesTrigger) {
		case 'action': {
			return (me && (me.id === note.userId)) || (note.myReaction != null);
		}

		case 'all': {
			return true;
		}

		case 'see': {
			const isSeen = seenNotes.includes(note.id);
			if (isSeen) return true;

			seenNotes.push(note.id);
			return false;
		}

		default: {
			return false;
		}
	}
}
