/**
 * Helpers for setting up sorting and paging, used by various components
 */

/**
 * Sort direction (either 'ASC' or 'DESC')
 */
export class SortDirection {
	public static desc: string = 'DESC';
	public static asc: string = 'ASC';
}

export class SortDisplayOption {
	constructor(
		public label: string,
		public sortField: string,
		public sortDir: SortDirection
	) {}
}

