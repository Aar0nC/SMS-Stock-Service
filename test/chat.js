'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const expect = chai.expect;
const chatStrings = require('./../chat/chatStrings');
const server = require('./../chat/twilioWebHook');
const _ = require('lodash');
const sinon = require('sinon');
let twilioWrapper = require('../chat/twilioWrapper');
chai.use(chaiHttp);

describe('Twilio Chat', () => {
    describe('POST /sms', () => {
        describe('commands', () => {
           it('should return all available commands', (done) => {
               chai.request(server)
                   .post('/sms')
                   .send({Body: 'commands'})
                   .end((err, res) => {
                       res.should.have.status(200);
                       res.type.should.be.eql('text/xml');
                       expect(_.includes(res.text, chatStrings.commands.substring(0,30))).to.be.true;
                       done();
                   });
           });
        });

        describe('invalid/empty command', () => {
            it('should reply that the command is invalid', (done) => {
                chai.request(server)
                    .post('/sms')
                    .send({Body: 'invalid'})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.type.should.be.eql('text/xml');
                        expect(_.includes(res.text, chatStrings.invalidCommand)).to.be.true;
                        done();
                    });
            });

            it('should reply that the command is invalid', (done) => {
                chai.request(server)
                    .post('/sms')
                    .send({Body: ""})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.type.should.be.eql('text/xml');
                        expect(_.includes(res.text, chatStrings.invalidCommand)).to.be.true;
                        done();
                    });
            });
        });

        describe('subscribe', () => {
           it('should require a name', (done) => {
               chai.request(server)
                   .post('/sms')
                   .send({Body: 'subscribe'})
                   .end((err, res) => {
                       res.should.have.status(200);
                       res.type.should.be.eql('text/xml');
                       expect(_.includes(res.text, chatStrings.subscriberNoName.substring(0, 30))).to.be.true;
                       done();
                   });
           });

           it('should add the subscriber', (done) => {
               chai.request(server)
                   .post('/sms')
                   .send({Body: 'subscribe Test', From: '+4165555555'})
                   .end((err, res) => {
                       //TODO: use dynalite and verify that subscriber was added to DB.
                       res.should.have.status(200);
                       res.type.should.be.eql("text/xml");
                       expect(_.includes(res.text, 'Thank you for subscribing')).to.be.true;
                       done();
                   });
           });

            afterEach((done) => {
                chai.request(server)
                    .post('/sms')
                    .send({Body: "unsub", From: "+4165555555"})
                    .end((err, res) => {
                        done();
                    });
            });
        });

        describe('unsubscribe', () => {
            beforeEach((done) => {
                chai.request(server)
                    .post('/sms')
                    .send({Body: 'subscribe Test', From: '+4165555555'})
                    .end((err, res) => {
                        done();
                    });
            });

            it('should remove the subscriber', (done) => {
               chai.request(server)
                   .post('/sms')
                   .send({Body: "unsub"})
                   .end((err, res) => {
                       res.should.have.status(200);
                       res.type.should.be.eql('text/xml');
                       expect(_.includes(res.text, "Sorry to see you go."));
                       done();
                   });
            });
        });

        describe('update', () => {
            beforeEach((done) => {
                chai.request(server)
                    .post('/sms')
                    .send({Body: 'subscribe Test', From: '+4165555555'})
                    .end((err, res) => {
                        done();
                    });
            });

            it('should give an immediate stock update', (done) => {
                sinon.stub(twilioWrapper, 'sendMessage', function() {
                   //don't send an SMS
                });

                chai.request(server)
                    .post('/sms')
                    .send({Body: 'update', From: '+4165555555'})
                    .end((err, res) => {
                        res.should.have.status(200);
                        sinon.assert.calledOnce(twilioWrapper.sendMessage);
                        twilioWrapper.sendMessage.restore();
                        done();
                    });
            });

            afterEach((done) => {
                chai.request(server)
                    .post('/sms')
                    .send({Body: 'unsub', From: '+4165555555'})
                    .end((err, res) => {
                        done();
                    });
            });
        });
    });
});