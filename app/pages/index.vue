<script>
import { user } from "~~/server/api/use-auth";

// <NuxtLink to="/admin/create-routemap">Create Route Map</NuxtLink>
// <NuxtLink to="/admin/edit-routemap">Edit Route Map</NuxtLink>
//     <NuxtLink to="/admin/create-route">Create Route</NuxtLink>
//       <NuxtLink to="/list-routes">View Routes</NuxtLink>
</script>

<template>
  <div class="background-image">
    <div class="box-container">
      <h1 class="welcome-message">NHS</h1>
      <h1 class="welcome-message">Pathfinder</h1>
      <p class="hospital-name">Northern General Hospital</p>
    </div>
    <div class="box-container-center">
      <div class="location-text">
        <h2>Find your path:</h2>
        <p>Enter your start location.</p>
      </div>
      <input type="text" placeholder="Enter your current location" />
      <div class="location-text">
        <p>Enter your destination.</p>
      </div>
      <input type="text" placeholder="Enter your destination" />
      <div class="checkbox-group">
        <label>
          <input type="checkbox" /> I'm in a wheelchair / don't use elevators.
        </label>
      </div>
      <a href="#" class="button">Start Pathway</a>
    </div>
  </div>

  <div class="admin-links">
    <NuxtLink to="/admin/media">Media</NuxtLink>
    <NuxtLink to="/admin/list-routesadmin">List routesadmin</NuxtLink>
    <NuxtLink to="/admin/review-media">Review Media</NuxtLink>
    <NuxtLink to="/admin/bfs-debug">BFS Debug</NuxtLink>
    <NuxtLink to="/admin/node">Add Node</NuxtLink>
    <NuxtLink to="/admin/connections">Connections</NuxtLink>
    <NuxtLink to="admin/users"> Users</NuxtLink>
  </div>
</template>
