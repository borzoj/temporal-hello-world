import { Context } from '@temporalio/activity'

export async function hello (name:string): Promise<string> {
  console.log("hello activity", {name})
  if (name.toLowerCase() === 'green') {
    throw new Error('green boom')
  }
  return 'Hello ' + name
}

export async function world ( hello:String ): Promise<string> {
  console.log("world activity", {hello})
  if (hello.toLocaleLowerCase().indexOf('red')>=0) {
    throw new Error('red boom')
  }
  return hello + ' World'
}
