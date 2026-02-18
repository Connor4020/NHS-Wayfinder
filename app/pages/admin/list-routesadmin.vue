<script setup>

const { data: connections, pending, error } = await useFetch('/api/connection')

console.log('connections data:', connections.value)

</script>



<template>
        <div>
                <h1>Connections</h1>
                <p v-if="pending">Loading connections...</p>
                <p v-if="error">Error: {{ error }}</p>
                                <ul v-if="connections">
                                        <li v-for="c in connections" :key="`${c.node_1}-${c.node_2}`">
                                                <div>
                                                    <strong>{{ c.node_1 }} → {{ c.node_2 }}</strong>
                                                    <span v-if="c.wheelchair_accessible"> • wheelchair accessible</span>
                                                    <span v-if="c.uses_lift"> • lift</span>
                                                    <span v-if="c.uses_stairs"> • stairs</span>
                                                </div>

                                                <div v-if="c.media && c.media.length">
                                                    <h5>Connected media</h5>
                                                    <ul>
                                                        <li v-for="m in c.media" :key="m.media_id + '-' + m.order_num">
                                                            <div>
                                                                <span v-if="m.media_type && m.media_type.startsWith('image')">
                                                                    <img :src="m.media_url" alt="media" style="max-width:120px; max-height:80px" />
                                                                </span>
                                                                <span v-else-if="m.media_type && m.media_type.startsWith('video')">
                                                                    <video :src="m.media_url" controls style="max-width:160px; max-height:90px"></video>
                                                                </span>
                                                                <span v-else>
                                                                    <a :href="m.media_url" target="_blank">Open media {{ m.media_id }}</a>
                                                                </span>
                                                                <small style="margin-left:8px">(id: {{ m.media_id }}{{ m.order_num ? ', order: ' + m.order_num : '' }})</small>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                        </li>
                                </ul>
                <p v-if="connections && connections.length === 0">No connections found.</p>
        </div>
</template>