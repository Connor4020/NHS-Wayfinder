<script setup lang="ts">

import { ref, computed, watchEffect } from 'vue'
import useMediaChecks from '../../../composables/useMediaChecks'
import useGlobalMediaPreview from '../../../composables/useGlobalMediaPreview'
import usePagination from '../../../composables/usePagination'
import useNodeLabels from '../../../composables/useNodeLabels'
import useConfirmAction from '../../../composables/useConfirmAction'
const { isImageType, isVideoType } = useMediaChecks()
const { openGlobalMediaPreview } = useGlobalMediaPreview()
const { confirmAndRun } = useConfirmAction()







const deleting = ref(false)
const reordering = ref(false)
const updatingAccessibility = ref(false)
const CONNECTIONS_PAGE_SIZE = 50
const connectionsTotal = ref(0)
const {
    page: connectionsPage,
    offset: connectionsOffset,
    totalPages: connectionsTotalPages,
    hasNext: connectionsHasNext,
    hasPrev: connectionsHasPrev,
    nextPage: nextConnectionsPage,
    prevPage: prevConnectionsPage
} = usePagination(connectionsTotal, CONNECTIONS_PAGE_SIZE)

function sortConnectionMedia(mediaList: any[]) {
    return [...(mediaList || [])].sort((a: any, b: any) => {
        const aOrder = (typeof a.order_num === 'number') ? a.order_num : Number.MAX_SAFE_INTEGER
        const bOrder = (typeof b.order_num === 'number') ? b.order_num : Number.MAX_SAFE_INTEGER
        if (aOrder !== bOrder) return aOrder - bOrder
        return Number(a.media_id) - Number(b.media_id)
    })
}

function sortedConnectionMedia(connection: any) {
    return sortConnectionMedia(connection?.media || [])
}

function connectionKey(connection: any) {
    return `${connection.node_1}-${connection.node_2}`
}

const draggingMedia = ref<{ key: string, mediaId: number } | null>(null)

function onMediaDragStart(connection: any, media: any, event: DragEvent) {
    draggingMedia.value = { key: connectionKey(connection), mediaId: Number(media.media_id) }
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', String(media.media_id))
    }
}

function onMediaDragOver(connection: any, event: DragEvent) {
    if (!draggingMedia.value) return
    if (draggingMedia.value.key !== connectionKey(connection)) return
    event.preventDefault()
    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move'
    }
}

function onMediaDragEnd() {
    draggingMedia.value = null
}

async function saveConnectionMediaOrder(connection: any, orderedMedia: any[]) {
    reordering.value = true
    try {
        await Promise.all(
            orderedMedia.map((mediaItem: any, index: number) => {
                return $fetch('/api/connection-media', {
                    method: 'PATCH',
                    body: {
                        connection_node_1: connection.node_1,
                        connection_node_2: connection.node_2,
                        media_id: mediaItem.media_id,
                        order_num: index + 1
                    }
                })
            })
        )
        await refresh()
    } catch (err) {
        alert(String((err as any)?.message || err))
    } finally {
        reordering.value = false
    }
}

async function onMediaDrop(connection: any, targetMedia: any, event: DragEvent) {
    event.preventDefault()
    const dragging = draggingMedia.value
    draggingMedia.value = null
    if (!dragging) return
    if (dragging.key !== connectionKey(connection)) return

    const list = sortedConnectionMedia(connection)
    const fromIndex = list.findIndex((m: any) => Number(m.media_id) === dragging.mediaId)
    const targetIndex = list.findIndex((m: any) => Number(m.media_id) === Number(targetMedia.media_id))
    if (fromIndex === -1 || targetIndex === -1 || fromIndex === targetIndex) return

    const reordered = [...list]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(targetIndex, 0, moved)

    await saveConnectionMediaOrder(connection, reordered)
}

async function deleteConnection(node_1: number, node_2: number) {
    await confirmAndRun(`Delete connection ${node_1} → ${node_2}?`, async () => {
        deleting.value = true
        try {
            await $fetch('/api/connection', { method: 'DELETE', body: { node_1, node_2 } })
            await refresh()
        } catch (err) {
            alert(String((err as any)?.message || err))
        } finally {
            deleting.value = false
        }
    })
}

async function updateWheelchairAccessible(node_1: number, node_2: number, nextValue: boolean) {
    updatingAccessibility.value = true
    try {
        await $fetch('/api/connection', {
            method: 'PATCH',
            body: {
                node_1,
                node_2,
                wheelchair_accessible: nextValue
            }
        })
        await refresh()
    } catch (err) {
        alert(String((err as any)?.message || err))
    } finally {
        updatingAccessibility.value = false
    }
}

async function deleteConnectionMedia(connection_node_1: number, connection_node_2: number, media_id: number) {
    await confirmAndRun(`Delete media ${media_id} from connection ${connection_node_1} → ${connection_node_2}?`, async () => {
        deleting.value = true
        try {
            await $fetch('/api/connection-media', { method: 'DELETE', body: { connection_node_1, connection_node_2, media_id } })
            await refresh()
        } catch (err) {
            alert(String((err as any)?.message || err))
        } finally {
            deleting.value = false
        }
    })
}

async function editConnectionMediaDesc(connection_node_1: number, connection_node_2: number, media_id: number, currentDesc: string | null) {
    const val = prompt('Edit media description (leave blank to clear):', currentDesc || '')
    if (val === null) return
    const newDesc = (String(val).trim() === '') ? null : String(val).trim()
    try {
        await $fetch('/api/connection-media', { method: 'PATCH', body: { connection_node_1, connection_node_2, media_id, content_desc: newDesc } })
        await refresh()
    } catch (err) {
        alert(String((err as any)?.message || err))
    }
}


const { data: connectionsResponse, pending, error, refresh } = await useFetch('/api/connection', {
    query: computed(() => ({
        limit: CONNECTIONS_PAGE_SIZE,
        offset: connectionsOffset.value
    }))
})
const connectionsPayload = computed(() => (connectionsResponse.value || {}) as any)
const connections = computed(() => connectionsPayload.value.items || [])
watchEffect(() => {
    connectionsTotal.value = Number(connectionsPayload.value.total || 0)
})

const { data: nodes, pending: nodesPending, error: nodesError } = await useFetch('/api/node')
const nodesPayload = computed(() => (nodes.value || []) as any[])
const { nodeLabel, nodesList } = useNodeLabels(nodesPayload as any)

async function refreshConnectionsPage() {
    await refresh()
}

console.log('connections data:', connections.value)

// Filter state
const filterFrom = ref('')
const filterTo = ref('')
const filterAccessible = ref(false)
const filterHideAll = ref(false)

const filteredConnections = computed(() => {
    const list = (connections && connections.value) || []
    if (filterHideAll.value) return []
    return list.filter((c: any) => {
        if (filterAccessible.value && !c.wheelchair_accessible) return false
        if (filterFrom.value !== '' && String(c.node_1) !== String(filterFrom.value)) return false
        if (filterTo.value !== '' && String(c.node_2) !== String(filterTo.value)) return false
        return true
    })
})
const connectionsShowingCount = computed(() => filteredConnections.value.length)

</script>



<template>
    <main>
        <AdminBackButton />
        <h1>Connections</h1>
        <p v-if="pending">Loading connections...</p>
        <p v-if="error">Error: {{ error }}</p>

        <div class="form-group">
            <label>From:
                <select v-model="filterFrom">
                    <option value="">All</option>
                    <option v-for="n in nodesList" :key="n.node_id" :value="String(n.node_id)">{{ n.node_name ||
                        n.name || n.node_id }}</option>
                </select>
            </label>
            <label>To:
                <select v-model="filterTo">
                    <option value="">All</option>
                    <option v-for="n in nodesList" :key="'to-' + n.node_id" :value="String(n.node_id)">{{
                        n.node_name || n.name || n.node_id }}</option>
                </select>
            </label>
            <label><input type="checkbox" v-model="filterAccessible" /> Wheelchair only</label>
            <label><input type="checkbox" v-model="filterHideAll" /> Hide all connections</label>
            <button
                @click="filterFrom = ''; filterTo = ''; filterAccessible = false; filterHideAll = false">Reset</button>
            <span>Showing {{ connectionsShowingCount }} / {{ connectionsTotal }} connections</span>
            <button :disabled="!connectionsHasPrev || pending" @click="prevConnectionsPage">Previous page</button>
            <button :disabled="!connectionsHasNext || pending" @click="nextConnectionsPage">Next page</button>
            <button :disabled="pending" @click="refreshConnectionsPage">Refresh</button>
            <span>Page {{ connectionsPage }} / {{ connectionsTotalPages }}</span>
        </div>

<<<<<<< HEAD

        <div class="table-container">
            <div v-if="pending">Loading connections…</div>
            <div v-else-if="error">Error loading connections</div>

            <table v-else class="styled-table">
                <thead>
                    <tr>
                        <th>From</th>
                        <th>To</th>
                        <th>Wheelchair accessible</th>
                        <th>Media (drag rows to reorder)</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="c in filteredConnections" :key="c.node_1 + '-' + c.node_2">
                        <td>
                            <NuxtLink :to="{ path: '/watch-route', query: { node_1: c.node_1, node_2: c.node_2 } }">
                                {{ nodeLabel(c.node_1) }} ({{ c.node_1 }})
                            </NuxtLink>
                        </td>
                        <td>{{ nodeLabel(c.node_2) }} ({{ c.node_2 }})</td>
                        <td>
                            <label>
                                <input type="checkbox" :checked="!!c.wheelchair_accessible"
                                    :disabled="updatingAccessibility || deleting || reordering"
                                    @change="updateWheelchairAccessible(c.node_1, c.node_2, ($event.target as HTMLInputElement).checked)" />
                                {{ c.wheelchair_accessible ? 'Yes' : 'No' }}
                            </label>
                        </td>
                        <td>
                            <table v-if="c.media && c.media.length" class="styled-table">
                                <thead>
                                    <tr>
                                        <th>Drag</th>
                                        <th>Order</th>
                                        <th>Media</th>
                                        <th>Description</th>
                                        <th>Media actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="m in sortedConnectionMedia(c)" :key="m.media_id + '-' + m.order_num"
                                        draggable="true" @dragstart="onMediaDragStart(c, m, $event)"
                                        @dragover="onMediaDragOver(c, $event)" @drop="onMediaDrop(c, m, $event)"
                                        @dragend="onMediaDragEnd">
                                        <td title="Drag to reorder" aria-label="Drag to reorder">☰</td>
                                        <td>{{ m.order_num || '-' }}</td>
                                        <td>
                                            <span v-if="isImageType(m)">
                                                <img :src="m.media_url" alt="media"
                                                    class="media-thumb media-thumb-hover" draggable="false"
                                                    @dragstart.prevent @mousedown.stop
                                                    @click.stop="openGlobalMediaPreview(m.media_url)" />
                                            </span>
                                            <span v-else-if="isVideoType(m)">
                                                <video :src="m.media_url" controls class="media-thumb" draggable="false"
                                                    @dragstart.prevent></video>
                                            </span>
                                            <span v-else>
                                                <a :href="m.media_url" target="_blank">Open media {{ m.media_id }}</a>
                                            </span>
                                        </td>
                                        <td>{{ m.content_desc || '—' }}</td>
                                        <td>
                                            <button :disabled="deleting || reordering"
                                                @click="deleteConnectionMedia(c.node_1, c.node_2, m.media_id)">Delete
                                                media</button>
                                            <button :disabled="deleting || reordering"
                                                @click="editConnectionMediaDesc(c.node_1, c.node_2, m.media_id, m.content_desc)">Edit
                                                description</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <span v-else>No media assigned.</span>
                        </td>
                        <td>
                            <button :disabled="deleting" @click="deleteConnection(c.node_1, c.node_2)">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p v-if="connections && connections.length === 0">No connections found.</p>
        </div>
    </main>
=======
        <div v-if="pending">Loading connections…</div>
        <div v-else-if="error">Error loading connections</div>
        <table v-else class="styled-table">
            <thead>
                <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Wheelchair accessible</th>
                    <th>Media (drag rows to reorder)</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="c in filteredConnections" :key="c.node_1 + '-' + c.node_2">
                    <td>
                        <NuxtLink :to="{ path: '/watch-route', query: { node_1: c.node_1, node_2: c.node_2 } }">
                            {{ nodeLabel(c.node_1) }} ({{ c.node_1 }})
                        </NuxtLink>
                    </td>
                    <td>{{ nodeLabel(c.node_2) }} ({{ c.node_2 }})</td>
                    <td>
                        <label>
                            <input
                                type="checkbox"
                                :checked="!!c.wheelchair_accessible"
                                :disabled="updatingAccessibility || deleting || reordering"
                                @change="updateWheelchairAccessible(c.node_1, c.node_2, ($event.target as HTMLInputElement).checked)"
                            />
                            {{ c.wheelchair_accessible ? 'Yes' : 'No' }}
                        </label>
                    </td>
                    <td>
                        <table v-if="c.media && c.media.length" class="styled-table">
                            <thead>
                                <tr>
                                    <th>Drag</th>
                                    <th>Order</th>
                                    <th>Media</th>
                                    <th>Description</th>
                                    <th>Media actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="m in sortedConnectionMedia(c)"
                                    :key="m.media_id + '-' + m.order_num"
                                    draggable="true"
                                    @dragstart="onMediaDragStart(c, m, $event)"
                                    @dragover="onMediaDragOver(c, $event)"
                                    @drop="onMediaDrop(c, m, $event)"
                                    @dragend="onMediaDragEnd"
                                >
                                    <td title="Drag to reorder" aria-label="Drag to reorder">☰</td>
                                    <td>{{ m.order_num || '-' }}</td>
                                    <td>
                                        <span v-if="isImageType(m)">
                                            <img
                                                :src="m.media_url"
                                                alt="media"
                                                class="media-thumb media-thumb-hover"
                                                draggable="false"
                                                @dragstart.prevent
                                                @mousedown.stop
                                                @click.stop="openGlobalMediaPreview(m.media_url)"
                                            />
                                        </span>
                                        <span v-else-if="isVideoType(m)">
                                            <video
                                                :src="m.media_url"
                                                controls
                                                class="media-thumb"
                                                draggable="false"
                                                @dragstart.prevent
                                                @mousedown.stop
                                                @click.stop="openGlobalMediaPreview(m.media_url, 'video')"
                                            ></video>
                                        </span>
                                        <span v-else>
                                            <a :href="m.media_url" target="_blank">Open media {{ m.media_id }}</a>
                                        </span>
                                    </td>
                                    <td>{{ m.content_desc || '—' }}</td>
                                    <td>
                                        <button :disabled="deleting || reordering" @click="deleteConnectionMedia(c.node_1, c.node_2, m.media_id)">Delete media</button>
                                        <button :disabled="deleting || reordering" @click="editConnectionMediaDesc(c.node_1, c.node_2, m.media_id, m.content_desc)">Edit description</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <span v-else>No media assigned.</span>
                    </td>
                    <td>
                        <button :disabled="deleting" @click="deleteConnection(c.node_1, c.node_2)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <p v-if="connections && connections.length === 0">No connections found.</p>
    </div>
>>>>>>> 6994fe741dda2d97f1ef5ff6bd6196eeb9d9844b
</template>