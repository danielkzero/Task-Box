<template>
    <div class="empty-state">
        <img :src="image" :alt="alt" />
        <p class="title">{{ title }}</p>
        <p class="description">
            <slot />
        </p>
    </div>
</template>

<script setup lang="ts">
defineProps<{ image: string; alt: string; title: string }>();
</script>

<style>
.empty-state {
    text-align: center;
    padding: 1rem;
    color: #666;
}

.empty-state img {
    max-width: 200px;
    opacity: 0.6;
    margin-bottom: 1rem;
}

.empty-state .title {
    font-weight: 500;
    font-size: 1rem;
}

.empty-state .description {
    font-size: 0.9rem;
    color: #999;
}
</style>
