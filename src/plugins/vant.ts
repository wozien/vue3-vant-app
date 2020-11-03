import { App } from 'vue'
import { 
  Button,
  Field,
  Checkbox,
  Popup,
  Picker
} from 'vant'

export default function(app: App){
  app.use(Button)
  app.use(Field)
  app.use(Checkbox)
  app.use(Popup)
  app.use(Picker)
}