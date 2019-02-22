# just test flowchart
```flow
st=>start: 开始|past:>http://www.google.com[blank]
e=>end: End|future:>http://www.google.com
op1=>operation: My Operation|past
op2=>operation: Stuff|current
sub1=>subroutine: My Subroutine|invalid
cond=>condition: 成功是否？|approved:>http://www.google.com
c2=>condition: 好主意|rejected
io=>inputoutput: catch something...|future

st->op1(right)->cond
cond(yes, right)->c2
cond(no)->sub1(left)->op1
c2(yes)->io->e
c2(no)->op2->e
```

# just test puml
```puml
class Car

Driver - Car : drives >
Car *- Wheel : have 4 >
Car -- Person : < owns
```
