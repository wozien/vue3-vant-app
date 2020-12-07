import { defineComponent} from 'vue'

export default defineComponent({
    emits: ['click'],

    setup(props, { emit }) {
        const onClick = () => {
            emit('click')
        }

        return () => {
            return <button onClick={onClick}>11</button>
        }
    }
})