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

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: "ok";
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
}
