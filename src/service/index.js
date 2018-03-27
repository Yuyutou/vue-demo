import axios from 'axios';

export const employees = [
    {name: 'aa', age: '22', content: '22', city: 'shanghai'},
    {name: 'bb', age: '223', content: '232', city: 'beijing'},
    {name: 'cc', age: '223', content: '2cc2', city: 'shenzhen'}
];

export function getSomeData() {
    // axios.get('/user/12345', {
    //     cancelToken: source.token
    // }).catch(function(thrown) {
    //     if (axios.isCancel(thrown)) {
    //         console.log('Request canceled', thrown.message);
    //     } else {
           
    //     }
    // });
}

export function getEmployeesFetch() {
    return [...employees];
}