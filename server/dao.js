"use strict";

const sqlite = require('sqlite3');
const dayjs = require('dayjs');

const db = new sqlite.Database('./CMS_db.db', (err) => { if (err) throw err; });

exports.getName = () => {
    return new Promise((res, rej) => {
        let sql = "SELECT name FROM site";

        db.get(sql, [], (err, row) => {
            if (err) {
                rej(err);
                return;
            }
            //console.log(rows);
            const name = row.name;
            res(name);

        });
    });
}

exports.setName = (name) => {

    return new Promise((resolve, reject) => {
        db.run('DELETE FROM site', [], function (err) {
            if (err) {
                reject(err);
                return;
            }
            const sql = "INSERT INTO site(name) VALUES(?)";
            db.run(sql, [name], function (err) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(true);
            });
        });
    });
}

exports.getAllPublishedPages = () => {

    return new Promise((res, rej) => {
        let sql = "SELECT pages.id AS page_id,pages.title AS page_title,status, data, dataCreazione, name AS author_name FROM pages,users WHERE pages.autor=users.id AND pages.status='pubblicata' ORDER BY data";

        db.all(sql, [], (err, rows) => {
            if (err) {
                rej(err);
                return;
            }
            //console.log(rows);
            const pages = rows.map((e) => ({ id: e.page_id, title: e.page_title, author: e.author_name, status: e.status, date: e.data, dataCreazione: e.dataCreazione }));
            res(pages);

        });
    });
}

exports.getAllPages = () => {

    return new Promise((res, rej) => {
        let sql = "SELECT pages.id AS page_id,pages.title AS page_title,status, data, dataCreazione, name AS author_name FROM pages,users WHERE pages.autor=users.id ORDER BY data";

        db.all(sql, [], (err, rows) => {
            if (err) {
                rej(err);
                return;
            }
            //console.log(rows);
            const pages = rows.map((e) => ({ id: e.page_id, title: e.page_title, status: e.status, author: e.author_name, date: e.data, dataCreazione: e.dataCreazione }));
            res(pages);

        });
    })


}

exports.createPage = (title, author, status, creation, date) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO pages(autor,title,status,data,dataCreazione) VALUES(?,?,?,?,?)";
        db.run(sql, [author, title, status, date, creation], function (err) {
            if (err) {
                reject(err);
            }
            const id = this.lastID;
            const sql1 = "INSERT INTO blocks(type,content,indice,page) VALUES(?,?,?,?)";
            db.run(sql1, ['header', 'Example header', 0, id], function (err1) {
                if (err1) {
                    reject(err1);
                }
                db.run(sql1, ['paragraph', 'Example paragraph', 1, id], function (err2) {
                    if (err2) {
                        reject(err2);
                    }
                    resolve(id);
                });
            });
        });
    });
}

exports.deletePage = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM blocks WHERE page=?";
        db.run(sql, [id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            const sql1 = "DELETE FROM pages WHERE id=?";
            db.run(sql1, [id], function (err1) {
                if (err1) {
                    reject(err1);
                    return;
                }

                resolve(this.changes);
            });
        });
    });
}

exports.getAuthors = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT name,id FROM users"
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);

        });
    });
}

exports.setAuthor = (id, author) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE pages SET autor=? WHERE id=?";
        db.run(sql, [author, id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
}

exports.getBlock = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM blocks WHERE id=?"
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);

        });
    });
}

exports.updateBlock = (id, type, content, page) => {
    return new Promise((resolve, reject) => {
        this.getBlock(id)
            .then(block => {
                if ((block.type == 'header' && type == 'header') || ((block.type == 'paragraph' || block.type == 'image') && (type == 'paragraph' || type == 'image'))) {
                    const sql = "UPDATE blocks SET type=?,content=? WHERE id=?";
                    db.run(sql, [type, content, id], function (err) {
                        if (err) {
                            console.log(err);
                            reject(err);
                            return;
                        }
                        resolve(this.changes);
                    });
                } else {
                    checkBlocksCount(page, id)
                        .then(i => {
                            const sql = "UPDATE blocks SET type=?,content=? WHERE id=?";
                            db.run(sql, [type, content, id], function (err) {
                                if (err) {
                                    console.log(err);
                                    reject(err);
                                    return;
                                }
                                resolve(this.changes);
                            });
                        })
                        .catch(e=>reject(e));
                }
            })
            .catch(e => {
                reject(e);
            });

    });
}

exports.setDate = (date, status, id) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE pages SET data=?,status=? WHERE id=?";
        db.run(sql, [date, status, id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
}

exports.getPageInfoByID = (id) => {
    return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM pages WHERE id=?";
        db.get(sql, [id], (err, row) => {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            if (row == undefined) {
                reject({ error: 'Page not found.' });
            } else {
                resolve(row);
            }
        })
    });
}

exports.getPageById = (id) => {
    return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM blocks WHERE page=? ORDER BY indice";

        db.all(sql, [id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const page = rows.map((e) => ({ block_id: e.id, type: e.type, content: e.content, index: e.indice, page_id: e.page }));
            resolve(page);
        });
    });

}

exports.getPageTitle = (id) => {
    return new Promise((resolve, reject) => {
        let sql = "SELECT title FROM pages WHERE id=?";
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (row == undefined) {
                reject({ error: 'Page not found.' });
            } else {

                resolve(row.title);
            }
        });
    });
}

function getMaxIndex(pageid) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT max(indice) AS indice FROM blocks WHERE page=?";
        db.get(sql, [pageid], (err, row) => {

            if (err) {
                reject(err);
                return;
            }
            if (row == undefined) {
                reject({ error: 'Page not found.' });
            } else {

                resolve(row.indice);
            }
        });
    });
}

exports.addBlock = (block, pageid) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO blocks(type,content,indice,page) VALUES(?,?,?,?)";
        getMaxIndex(pageid).then((maxIndex) => {
            //console.log(maxIndex);
            db.run(sql, [block.type, block.content, maxIndex + 1, pageid], function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this.lastID);
            });
        }).catch((err) => reject(err));


    });
}

exports.updateTitle = (page_id, title) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE pages SET title = ? WHERE id=?";
        db.run(sql, [title, page_id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
}

function checkBlocksCount(page_id, block_id) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT COUNT(id) AS nblocchi FROM blocks WHERE page=?";
        db.get(sql, [page_id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (row == undefined) {
                reject({ message: 'Page not found.' });
            } else {

                if (row.nblocchi < 3) {
                    reject({ message: 'Page must contain at least an header and a paragraph or image' });
                }
                const sql1 = "SELECT COUNT(id) AS nheaders FROM blocks WHERE page=? AND type='header'";
                db.get(sql1, [page_id], (err1, row1) => {
                    if (err1) {
                        reject(err1);
                        return;
                    }
                    if (row1 == undefined) {
                        reject({ message: 'Page not found.' });
                    } else {

                        const sql2 = "SELECT type,indice FROM blocks WHERE id=?";

                        db.get(sql2, [block_id], (err2, row2) => {
                            if (err2) {
                                reject(err2);
                                return;
                            }
                            if (row2 == undefined) {
                                reject({ message: 'Page not found.' });
                            } else {
                                if (row1.nheaders >= 2) {
                                    resolve(row2.indice);
                                }
                                else if (row2.type == 'header') {
                                    reject({ message: 'Page must contain at least an header and a paragraph or image' });
                                } else {
                                    resolve(row2.indice);
                                }
                            }
                        });




                        /*else {
                           const sql2 = "SELECT type,indice FROM blocks WHERE id=?";
                           db.get(sql2, [block_id], (err2, row2) => {
                               if (err2) {
                                   reject(err2);
                                   return;
                               }
                               if (row2 == undefined) {
                                   reject({ message: 'Page not found.' });
                               } else {
                                   if (row2.type == 'header') {
                                       reject({ message: 'Page must contain at least an header and a paragraph or image' });
                                   } else {
                                       resolve(row2.indice);
                                   }
                               }
                           });
                       }*/
                    }
                });

            }
        });
    });
}

exports.updateOrder = (pageid, blockid, indice) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE blocks SET indice=? WHERE page=? AND id=?";
        db.run(sql, [indice, pageid, blockid], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);

        });
    });
}

exports.deleteBlock = (id, page_id) => {
    return new Promise((resolve, reject) => {
        checkBlocksCount(page_id, id).then((indice) => {
            const sql1 = "UPDATE blocks SET indice=indice-1 WHERE page=? AND indice>?";
            db.run(sql1, [page_id, indice], function (err1) {
                if (err1) {
                    reject(err1);
                    return;
                }

                const sql = 'DELETE FROM blocks WHERE id = ?';
                db.run(sql, [id], function (err) {
                    if (err) {
                        reject(err);
                        return;
                    } else
                        resolve(this.changes);  // return the number of affected rows
                });
            });

        }).catch((errore) => {
            reject(errore);
        });

    });

}
/**
 * exports.deleteBlock = (id,page_id)=>{
    return new Promise((resolve, reject) => {
        
        const sql = 'DELETE FROM blocks WHERE id = ?';  // Double-check that the answer belongs to the userId
        db.run(sql, [id], function (err) {
          if (err) {
            reject(err);
            return;
          } else
            resolve(this.changes);  // return the number of affected rows
        });
      });

}
 * 
 */

exports.getImageList = () => {
    return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM images";

        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}
