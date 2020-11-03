import { App } from 'vue'
import { 
  Button,
  Field,
  Checkbox,
  Popup,
  Picker,
  Icon,
  Tabbar,
  TabbarItem
} from 'vant'

export default function(app: App){
  app.use(Button)
  app.use(Field)
  app.use(Checkbox)
  app.use(Popup)
  app.use(Picker)
  app.use(Icon)
  app.use(Tabbar)
  app.use(TabbarItem)
}