<script>

import useAuth from '../../server/api/use-auth'

const username = ''
const password = ''


const submit = async () => {
  try {
    await useAuth().login(username, password)
    
  } catch (e) {
    // show error message
  }
}
</script>



<template>
    <div>
        <h1>Login Page</h1>
        
        <form >
            <div>
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
            </div>
            
            <div>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit">Login</button>
        </form>
    </div>
</template>