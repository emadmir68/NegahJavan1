import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { createSession, sessionCookie } from '../src/auth.js';

export function testEnv() {
  const sqlite = new DatabaseSync(':memory:');
  const env = {ADMIN_PASSWORD:randomUUID(),AUTH_SECRET:randomUUID(),DB:{
    prepare(sql) {
      let values=[];
      return {
        bind(...args){values=args;return this},
        async run(){const result=sqlite.prepare(sql).run(...values);return {meta:{last_row_id:Number(result.lastInsertRowid)}}},
        async first(){return sqlite.prepare(sql).get(...values) || null},
        async all(){return {results:sqlite.prepare(sql).all(...values)}},
      };
    },
  }};
  return {env,sqlite};
}

export async function editorRequest(env) {
  const cookie=sessionCookie(await createSession(env)).split(';')[0];
  return (path,body,headers={},method='POST')=>new Request('https://negahjavan.ir'+path,{method,headers:{Origin:'https://negahjavan.ir',Cookie:cookie,'Content-Type':'application/json',...headers},...(body!==undefined?{body:JSON.stringify(body)}:{})});
}
