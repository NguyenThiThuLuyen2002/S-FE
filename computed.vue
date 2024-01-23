<template></template>
<script setup>
import { ref } from 'vue';

class MyObject {
  value1;
  value2;

  constructor(val1, val2) {
    this.value1 = ref(val1);
    this.value2 = ref(val2);
  }

  // Getter
  get mycomputed() {
    return this.value1.value + this.value2.value;
  }

  // Setter
  set mycomputed(newValue) {
    this.value1.value = newValue / 2;
    this.value2.value = newValue / 2;
  }
}

const myInstance = new MyObject(12, 2);

myInstance.value2.value = 40;
console.log(myInstance.mycomputed)

</script>
