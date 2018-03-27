<template>
    <div>
        <ul class="employees-box">
            <li v-for="employee in employees">
                <Employee 
                    :employee="employee" 
                    v-on:showContent="showContent"
                    v-on:showWorkCity="showWorkCity"
                    
                />
            </li>
        </ul>
    </div>
</template>
<style lang="less">
    .employees-box {
        li {
            font-size: 30px;
            margin-bottom: 2px;
            cursor: pointer;
            text-align: center;
            p:nth-of-type(1) {
                background: gray;
                color: #fff;
                padding: 10px 0;
            }
            p:nth-of-type(2) {
                padding: 10px 0;
            }
        }
    }
</style>
<script>
   
    import Employee from './employee.vue';
    import {getEmployeesFetch} from '../service';
    export default {
        data() {
            return {
                employees: [],
            }
        },
        components: {
            Employee
        },
        created() {
            console.log(getEmployeesFetch())
            this.employees = getEmployeesFetch().map(res => {
                return {
                    ...res,
                    status: false
                }
            });

            console.log(this.employees);
        },
        methods: {
            showContent: function(employee) {
                this.employees.forEach(res => res.status = false);
                employee.status = !employee.status;
            },
            showWorkCity: function(employee) {
                alert('work in'+employee.city);
            }
        }
    }
</script>