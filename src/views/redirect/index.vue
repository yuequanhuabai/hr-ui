<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const { params, query } = route
const target = '/' + (params.path as string)

router.replace({ path: target, query })
</script>

<template>
  <div></div>
</template>
