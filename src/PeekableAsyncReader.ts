import { AsyncReader } from './AsyncReader';
//var AsyncReader = require('./AsyncReader');

/**
 * Wraps AsyncReader to provide peek functionality
 */
export class PeekableAsyncReader {

  constructor(filename: string, highWaterMark: number = undefined){
      this.reader = new AsyncReader(filename, highWaterMark)
      this.peekedBytes = null
      this.read = this.read.bind(this)
    }
    
    private reader: any;
    private peekedBytes: any;

  /** Get position at which next read will occur */
  getPosition(){
      let peekedBytesLength = this.peekedBytes == null ? 0 : this.peekedBytes.length
      return this.reader.position - peekedBytesLength
  }

  isAtEnd(){
    return this.reader.isAtEnd();
}

  /** Close stream, after which no further reading is allowed */
  async close(){
      return this.reader.close()
  }

  /** Returns len bytes from the stream without adjusting the read position
   * @param len Number of bytes to peek and return
   */
  async peek(len: number){
      return new Promise((resolve, reject) => {
          this.reader.read(len)
              .then((buf: any) => {
                  this.peekedBytes = (this.peekedBytes == null) ? buf : this.peekedBytes + buf
                  resolve(buf)
              })
              .catch(reject)
      })
  }

  /** Returns a string with len bytes
   * @param len Number of bytes to read
   */
  async read(len: number){

      if( this.peekedBytes == null )
          return this.reader.read(len)

      return new Promise((resolve, reject) => {

          let peekedLen = this.peekedBytes.length

          if (len < peekedLen){
              let buf = this.peekedBytes
              this.peekedBytes = this.peekedBytes.slice(len)
              resolve(buf.slice(0, len))
          }
          else if (len == peekedLen){
              let buf = this.peekedBytes
              this.peekedBytes = null
              resolve(buf)
          }
          else{ // len > peekedLen
              this.reader.read(len - peekedLen)
                  .then((buf: any) => {
                      buf = this.peekedBytes + buf;
                      this.peekedBytes = null;
                      resolve(buf);
                  })
                  .catch(reject)
          }

      })
  }


}
//module.exports = PeekableAsyncReader

