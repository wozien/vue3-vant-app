
type DomainOpertor = '='|'!='|'>'|'<'|'>='|'<='
type DomainContionOpt = '&'|'|'
type DomainCondition = [string, DomainOpertor, number | string]
type DomainArr = Array<DomainContionOpt|DomainCondition>[]

class Domain {
  value: DomainArr

  constructor(initDomain: string | DomainArr) {
    this.value = this.normalize(initDomain)
  }

  normalize(initDomain: string | DomainArr): DomainArr {
    // TODO string => DomainArr
    return initDomain as DomainArr
  }
}

export default Domain