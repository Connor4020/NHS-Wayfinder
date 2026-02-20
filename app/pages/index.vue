<script>
import { user } from "~~/server/api/use-auth";
import '../public/css/index.css'

// <NuxtLink to="/admin/create-routemap">Create Route Map</NuxtLink>
// <NuxtLink to="/admin/edit-routemap">Edit Route Map</NuxtLink>
//     <NuxtLink to="/admin/create-route">Create Route</NuxtLink>
//       <NuxtLink to="/list-routes">View Routes</NuxtLink>

import { bfsShortestPath } from "@/../util/bfs";
import { createGraph } from "@/../util/graph";
import "../public/css/bfs-debug.css";




</script>

<template>
  <div class="background-image">
    <div class="box-container">
      <h1 class="welcome-message">{{ $t('home.title_nhs') }}</h1>
      <h1 class="welcome-message">{{ $t('home.title_pathfinder') }}</h1>
      <p class="hospital-name">{{ $t('home.hospital_name') }}</p>
    </div>

    <div class="box-container-center">
      <div class="location-text">
        <h2>{{ $t('home.find_path') }}</h2>
        <p>{{ $t('home.enter_start') }}</p>
      </div>
      <input type="text" :placeholder="$t('home.placeholder_current')" />

      <div class="location-text">
        <p>{{ $t('home.enter_dest') }}</p>
      </div>
      <input type="text" :placeholder="$t('home.placeholder_dest')" />

      <div class="checkbox-group">
        <label>
          <input type="checkbox" /> {{ $t('home.wheelchair_access') }}
        </label>
      </div>

      <a href="#" class="button">{{ $t('home.start_pathway') }}</a>
    </div>
  </div>

  <div class="admin-links">
    <NuxtLink to="/admin/media">{{ $t('admin.media') }}</NuxtLink>
    <NuxtLink to="/admin/bfs-debug">{{ $t('admin.bfs_debug') }}</NuxtLink>
    <NuxtLink to="/admin/dashboard">{{ $t('admin.dashboard') }}</NuxtLink>
    <NuxtLink to="/admin/node">{{ $t('admin.add_node') }}</NuxtLink>
    <NuxtLink to="/admin/connections">{{ $t('admin.connections') }}</NuxtLink>
    <NuxtLink to="admin/users"> {{ $t('admin.users') }}</NuxtLink>
  </div>
</template>
