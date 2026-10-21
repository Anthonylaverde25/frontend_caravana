/** A cause of death of the company's catalog. */
export interface DeathCause {
	id: number;
	code: string;
	name: string;
	description: string | null;
}

/** An active death batch the dead animal may go to. */
export interface DeathBatchOption {
	id: number;
	name: string;
}

/** The death of an animal as the API shows it. */
export interface DeathInfo {
	date: string;
	cause: string | null;
	observations?: string | null;
}

/** POST /caravans/deaths: one or several animals that died on the same day, of the same cause. */
export interface RegisterDeathPayload {
	caravan_ids: number[];
	death_date: string;
	death_cause_id: number;
	observations?: string | null;
	/** Only when the company has several death batches. */
	death_batch_id?: number | null;
}
