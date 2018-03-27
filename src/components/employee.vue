<template>
    <div>
        <p @click="showContent(employee)">{{employee.name}}</p>
        <p @click="showWorkCity(employee)" v-if="employee.status">{{employee.content}}</p>
    </div>
</template>
<script>
    export default {
        props: ['employee'],
        created() {
            console.log(this.employee, 'staff');
        },
        methods: {
            showContent: function(employee) {
                this.$emit("showContent", employee);
            },
            showWorkCity: function(employee) {
                this.$emit("showWorkCity", employee);
            }
        }
    }
</script>