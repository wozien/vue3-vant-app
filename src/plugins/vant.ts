import { App } from 'vue'
import { 
  Button,
  Field,
  Checkbox,
  Popup,
  Picker,
  Icon,
  Tabbar,
  TabbarItem,
  Image as VanImage,
  CellGroup,
  Cell,
  Dialog,
  Uploader,
  Search,
  List,
  PullRefresh,
  Tab,
  Tabs,
  Popover
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
  app.use(VanImage)
  app.use(Cell)
  app.use(CellGroup)
  app.use(Dialog)
  app.use(Uploader)
  app.use(Search)
  app.use(List)
  app.use(PullRefresh)
  app.use(Tabs)
  app.use(Tab)
  app.use(Popover)
}