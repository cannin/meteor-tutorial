import React from 'react';

import 'antd/dist/antd.css';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Tooltip from 'antd/lib/tooltip';
import Icon from 'antd/lib/icon';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';

import RecaptchaItem from './RecaptchaItem';


const FormItem = Form.Item;

class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      passwordDirty: false,
    };
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Received values of form: ', values);
        Meteor.call('verifyCaptcha', values.captcha, (error, result) => {
          if(error){
            console.log("Captcha verification failed with error: ", error);
          } else {
            if (result) {
              Accounts.createUser({
                username: values.username,
                email: values.email,
                password: values.password
              }, (error) => {
                if (error) console.log('Signup failed with error: ', error);
                else message.success("注册成功！");
              });
            } else {
              console.log("Captcha verification failed");
            }
          }
        });
      }
    });
  }
  handlePasswordBlur(e) {
    const value = e.target.value;
    this.setState({ passwordDirty: this.state.passwordDirty || !!value });
  }
  checkPassowrd(rule, value, callback) {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次输入的密码不一致！');
    } else {
      callback();
    }
  }
  checkConfirm(rule, value, callback) {
    const form = this.props.form;
    if (value && this.state.passwordDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  }
  usernameExists(rule, value, callback) {
    console.log('value: ', value);
    Meteor.call('usernameExists', value, (error, result) => {
      if (error) {
        console.log('There is an error while checking username');
        callback();
      } else {
        if (result) {
          callback('该用户名已经存在');

        } else {
          callback();
        }
      }
    });
  }
  emailExists(rule, value, callback) {
    console.log('value: ', value);
    Meteor.call('emailExists', value, (error, result) => {
      if (error) {
        console.log('There is an error while checking email');
        callback();
      } else {
        if (result) {
          callback('该E-mail已经存在');

        } else {
          callback();
        }
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };

    return (
      <Form horizontal onSubmit={this.handleSubmit.bind(this)} style={{maxWidth: 300}}>
        <FormItem
          {...formItemLayout}
          label={(
            <span>
              用户名&nbsp;
              <Tooltip title="用户名是登录时的唯一ID">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          )}
          hasFeedback
        >
          {getFieldDecorator('username', {
            rules: [{
              required: true, message: '请输入用户名'
            }, { validator: this.usernameExists.bind(this)
            }],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="密码"
          hasFeedback
        >
          {getFieldDecorator('password', {
            rules: [{
              required: true, message: '请输入密码',
            }, {
              validator: this.checkConfirm.bind(this),
            }],
          })(
            <Input type="password" onBlur={this.handlePasswordBlur.bind(this)} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="确认密码"
          hasFeedback
        >
          {getFieldDecorator('confirm', {
            rules: [{
              required: true, message: '请确认你的密码',
            }, {
              validator: this.checkPassowrd.bind(this),
            }],
          })(
            <Input type="password" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="E-mail"
          hasFeedback
        >
          {getFieldDecorator('email', {
            rules: [{
              type: 'email', message: '输入的E-mail地址不符合格式',
            }, {
              required: true, message: '请输入你的E-mail地址',
            }, {
              validator: this.emailExists.bind(this),
            }],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('captcha', {
            rules: [{ required: true, message: 'Please input the captcha you got!' }],
          })(<RecaptchaItem />)}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" style={{width: '100%'}}>注册</Button>
        </FormItem>
        <span>点击「注册」按钮，即代表你同意<a href="/terms">《用户协议》</a></span>
      </Form>
    );
  }
}

export default Form.create()(Signup);

