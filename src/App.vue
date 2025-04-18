<script setup>
import NavBar from './components/NavBar.vue'

</script>

<template>
  <div>
    <NavBar />
    <router-view />
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

#app {
  width: 100%;
  height: 100%;
}
</style>