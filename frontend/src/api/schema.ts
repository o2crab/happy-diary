/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** CycleComplete */
export interface CycleComplete {
  /** Verdict */
  verdict: "supported" | "not_supported" | "inconclusive";
  /**
   * Learnings
   * @minLength 1
   * @maxLength 2000
   */
  learnings: string;
}

/** CycleCreate */
export interface CycleCreate {
  /**
   * Hypothesis
   * @minLength 1
   * @maxLength 200
   */
  hypothesis: string;
  /**
   * Method
   * @minLength 1
   * @maxLength 1000
   */
  method: string;
  /**
   * Start Date
   * @format date
   */
  start_date: string;
  /**
   * End Date
   * @format date
   */
  end_date: string;
}

/** CycleDetail */
export interface CycleDetail {
  /** Id */
  id: number;
  /** Hypothesis */
  hypothesis: string;
  /** Method */
  method: string;
  /**
   * Start Date
   * @format date
   */
  start_date: string;
  /**
   * End Date
   * @format date
   */
  end_date: string;
  /** Status */
  status: "active" | "completed";
  /** Verdict */
  verdict: "supported" | "not_supported" | "inconclusive" | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Completed At */
  completed_at: string | null;
  /** Learnings */
  learnings: string | null;
  /** Entries */
  entries: EntryRead[];
  stats: CycleStats;
}

/** CycleStats */
export interface CycleStats {
  /** Recorded Days */
  recorded_days: number;
  /** Practiced Days */
  practiced_days: number;
  /** Avg Happiness Practiced */
  avg_happiness_practiced: number | null;
  /** Avg Happiness Not Practiced */
  avg_happiness_not_practiced: number | null;
}

/** CycleSummary */
export interface CycleSummary {
  /** Id */
  id: number;
  /** Hypothesis */
  hypothesis: string;
  /** Method */
  method: string;
  /**
   * Start Date
   * @format date
   */
  start_date: string;
  /**
   * End Date
   * @format date
   */
  end_date: string;
  /** Status */
  status: "active" | "completed";
  /** Verdict */
  verdict: "supported" | "not_supported" | "inconclusive" | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Completed At */
  completed_at: string | null;
}

/** EntryRead */
export interface EntryRead {
  /**
   * Date
   * @format date
   */
  date: string;
  /** Practiced */
  practiced: boolean;
  /** Happiness */
  happiness: number;
  /** Note */
  note: string;
}

/** EntryUpsert */
export interface EntryUpsert {
  /** Practiced */
  practiced: boolean;
  /**
   * Happiness
   * @min 1
   * @max 5
   */
  happiness: number;
  /**
   * Note
   * @maxLength 2000
   * @default ""
   */
  note?: string;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: "ok";
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
  /** Input */
  input?: any;
  /** Context */
  ctx?: object;
}

export namespace Api {
  /**
   * No description
   * @name GetHealth
   * @summary Get Health
   * @request GET:/api/health
   */
  export namespace GetHealth {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = HealthResponse;
  }

  /**
   * No description
   * @tags cycles
   * @name ListCycles
   * @summary List Cycles
   * @request GET:/api/cycles
   */
  export namespace ListCycles {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Status */
      status?: "active" | "completed" | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CycleSummary[];
  }

  /**
   * No description
   * @tags cycles
   * @name CreateCycle
   * @summary Create Cycle
   * @request POST:/api/cycles
   */
  export namespace CreateCycle {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CycleCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CycleDetail;
  }

  /**
   * No description
   * @tags cycles
   * @name GetCycle
   * @summary Get Cycle
   * @request GET:/api/cycles/{cycle_id}
   */
  export namespace GetCycle {
    export type RequestParams = {
      /** Cycle Id */
      cycleId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CycleDetail;
  }

  /**
   * No description
   * @tags cycles
   * @name UpsertEntry
   * @summary Upsert Entry
   * @request PUT:/api/cycles/{cycle_id}/entries/{entry_date}
   */
  export namespace UpsertEntry {
    export type RequestParams = {
      /** Cycle Id */
      cycleId: number;
      /**
       * Entry Date
       * @format date
       */
      entryDate: string;
    };
    export type RequestQuery = {};
    export type RequestBody = EntryUpsert;
    export type RequestHeaders = {};
    export type ResponseBody = EntryRead;
  }

  /**
   * No description
   * @tags cycles
   * @name CompleteCycle
   * @summary Complete Cycle
   * @request POST:/api/cycles/{cycle_id}/complete
   */
  export namespace CompleteCycle {
    export type RequestParams = {
      /** Cycle Id */
      cycleId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = CycleComplete;
    export type RequestHeaders = {};
    export type ResponseBody = CycleDetail;
  }
}
