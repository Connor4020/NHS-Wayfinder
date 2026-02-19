<script setup lang="ts">

import { ref, computed } from 'vue'
import useMediaChecks from '../../../composables/useMediaChecks'
const { displayMediaUrl, isImageType, isVideoType } = useMediaChecks()







const deleting = ref(false)

function nodeLabel(id) {
    const list = nodes?.value || []
    const found = list.find((n: any) => n.node_id === id)
    return found ? (found.node_name || found.name || String(found.node_id)) : String(id)
}

async function deleteConnection(node_1, node_2) {
    if (!confirm(`Delete connection ${node_1} → ${node_2}?`)) return
    deleting.value = true
    try {
        await $fetch('/api/connection', { method: 'DELETE', body: { node_1, node_2 } })
        await refresh()
    } catch (err) {
        alert(String(err?.message || err))
    } finally {
        deleting.value = false
    }
}

async function deleteConnectionMedia(connection_node_1: number, connection_node_2: number, media_id: number) {
    if (!confirm(`Delete media ${media_id} from connection ${connection_node_1} → ${connection_node_2}?`)) return
    deleting.value = true
    try {
        await $fetch('/api/connection-media', { method: 'DELETE', body: { connection_node_1, connection_node_2, media_id } })
        await refresh()
    } catch (err) {
        alert(String(err?.message || err))
    } finally {
        deleting.value = false
    }
}


const { data: connections, pending, error, refresh } = await useFetch('/api/connection')
const { data: nodes, pending: nodesPending, error: nodesError } = await useFetch('/api/node')




const nodesMap = computed(() => {
    const map = {}
    const list = (nodes && nodes.value) || []
    for (const n of list) {
        map[n.node_id] = n.node_name || n.name || String(n.node_id)
    }
    return map
})

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
                <NuxtLink :to="{ path: '/watch-route', query: { node_1: c.node_1, node_2: c.node_2 } }">
                    <strong>{{ nodesMap[c.node_1] || c.node_1 }} → {{ nodesMap[c.node_2] || c.node_2 }}</strong>
                </NuxtLink>
                <span v-if="c.wheelchair_accessible"> • wheelchair accessible</span>
                <span v-if="c.uses_lift"> • lift</span>
                <span v-if="c.uses_stairs"> • stairs</span>
            </div>
            <div v-if="c.media && c.media.length">
                <h5>Connected media</h5>
                    <ul>
                    <li v-for="m in c.media" :key="m.media_id + '-' + m.order_num">
                    <div>
                        <span v-if="isImageType(m)">
                            <img :src="m.media_url" alt="media" style="max-width:120px; max-height:80px" />
                        </span>
                    <div v-else-if="isVideoType(m)">
                        <video :src="m.media_url" controls style="max-width:300px; max-height:200px"></video>
                    </div>
                        <span v-else>
                            <a :href="m.media_url" target="_blank">Open media {{ m.media_id }}</a>
                        </span>
                        <small style="margin-left:8px">(id: {{ m.media_id }}{{ m.order_num ? ', order: ' + m.order_num : '' }})</small>
                        <button :disabled="deleting" @click="deleteConnectionMedia(c.node_1, c.node_2, m.media_id)">Delete</button>
                    </div>
                    </li>
                    </ul>
            </div>
            </li>
            </ul>
        <p v-if="connections && connections.length === 0">No connections found.</p>
    </div>
        <div>
        <h1>connections management</h1>

        <div v-if="pending">Loading connections…</div>
        <div v-else-if="error">Error loading connections</div>

        <table v-else style="width:100%;border-collapse:collapse">
            <thead>
                <tr>
                    <th style="text-align:left">From</th>
                    <th style="text-align:left">To</th>
                    <th style="text-align:left">Lift</th>
                    <th style="text-align:left">Stairs</th>
                    <th style="text-align:left">Wheelchair</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="c in connections" :key="c.node_1 + '-' + c.node_2">
                    <td>{{ nodeLabel(c.node_1) }} ({{ c.node_1 }})</td>
                    <td>{{ nodeLabel(c.node_2) }} ({{ c.node_2 }})</td>
                    <td>{{ c.uses_lift ? 'Yes' : 'No' }}</td>
                    <td>{{ c.uses_stairs ? 'Yes' : 'No' }}</td>
                    <td>{{ c.wheelchair_accessible ? 'Yes' : 'No' }}</td>
                    <td>
                        <button :disabled="deleting" @click="deleteConnection(c.node_1, c.node_2)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>