const {test}=require('node:test');const assert=require('node:assert/strict');const {cardsFor}=require('../services/insights');
const now=new Date('2026-09-06T12:00:00Z');
test('empty history invites logging without implying the user ate nothing',()=>{const c=cardsFor({},now);assert.equal(c.length,3);assert.match(c[1].body,/No meals are logged/);assert.equal(c[0].href,'/workout');});
test('insights compare completed sessions and disclose incomplete nutrition',()=>{const c=cardsFor({recent:3,previous:2,last:new Date(now-86400000),nutrition:{entries:2,calories:600,protein:45},proteinGoal:150},now);assert.match(c[0].body,/3 completed sessions/);assert.match(c[1].body,/45 g protein/);assert.match(c[1].body,/missing meals/);assert.match(c[2].id,/consistency/);});
