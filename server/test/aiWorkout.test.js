const {test}=require('node:test');const assert=require('node:assert/strict');
const {validate}=require('../controllers/aiWorkoutController');
test('workout validator rejects duplicates, excessive duration and fractional reps',()=>{
 const valid={name:'Legs',rationale:'Training',exercises:[{exerciseId:'a',sets:3,reps:8,rest_seconds:90}]};
 assert.doesNotThrow(()=>validate(valid,new Set(['a']),45));
 assert.throws(()=>validate({...valid,exercises:[valid.exercises[0],valid.exercises[0]]},new Set(['a']),45));
 assert.throws(()=>validate({...valid,exercises:[{...valid.exercises[0],sets:5,reps:30,rest_seconds:300}]},new Set(['a']),15));
 assert.throws(()=>validate({...valid,exercises:[{...valid.exercises[0],reps:8.5}]},new Set(['a']),45));
});
