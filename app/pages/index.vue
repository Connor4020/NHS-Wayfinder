<script>
import { user } from "~~/server/api/use-auth";
import Header from "../components/header.vue";

export default {
  components: {
    Header,
  },
};



// <NuxtLink to="/admin/create-routemap">Create Route Map</NuxtLink>
// <NuxtLink to="/admin/edit-routemap">Edit Route Map</NuxtLink>
//     <NuxtLink to="/admin/create-route">Create Route</NuxtLink>
//       <NuxtLink to="/list-routes">View Routes</NuxtLink>

</script>

<template>
  <Header/>
  <div>
    <h1>Welcome to Wayfinder</h1>
    <p>
      <NuxtLink to="/show-users">View Users</NuxtLink>
      <NuxtLink to="/add-user">Add User</NuxtLink>
    </p>

  </div>

  <div>
    <NuxtLink to="/admin/list-locations">List Locations</NuxtLink>
    <NuxtLink to="/admin/list-media">List Media</NuxtLink>
    <NuxtLink to="/admin/list-routesadmin">List routesadmin</NuxtLink>
    <NuxtLink to="/admin/qr-code">QR code</NuxtLink>
    <NuxtLink to="/admin/review-media">Review Media</NuxtLink>
    <NuxtLink to="/admin/bfs-debug">BFS Debug</NuxtLink>
    <NuxtLink to="/admin/add-node">Add Node</NuxtLink>
    <NuxtLink to="/admin/assign-media">Assign Media</NuxtLink>
  </div>
</template>
