import { login, createUserSession } from '~/utils/session.server';
import type { ActionFunction, HeadersFunction } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { Button, FormControl, Grid, Paper, TextField } from '@mui/material';

export let headers: HeadersFunction = () => {
  return {
    'Cache-Control': `public, max-age=${60 * 10}, s-maxage=${
      60 * 60 * 24 * 30
    }`,
  };
};

function validateUsername(email: unknown) {
  if (typeof email !== 'string' || email.length < 3) {
    return `Usernames must be at least 3 characters long`;
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== 'string' || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: { email: string | undefined; password: string | undefined };
  fields?: { email: string; password: string };
};

export const action: ActionFunction = async ({
  request,
}): Promise<Response | ActionData> => {
  const { email, password } = Object.fromEntries(await request.formData());
  if (typeof email !== 'string' || typeof password !== 'string') {
    return { formError: `Form not submitted correctly.` };
  }

  const fields = { email, password };
  const fieldErrors = {
    email: validateUsername(email),
    password: validatePassword(password),
  };

  if (Object.values(fieldErrors).some(Boolean)) return { fieldErrors, fields };

  const user = await login({ email, password });
  if (!user) {
    return {
      fields,
      formError: `Username/Password combination is incorrect`,
    };
  }
  return createUserSession(user.id, '/');
};

export default function Login() {
  const actionData = useActionData<ActionData | undefined>();
  return (
    <Grid container>
      <Grid item xs={12} style={{ textAlign: 'center' }}>
        <Paper
          sx={{
            m: 2,
            p: 2,
            paddingBottom: 6,
            '& .MuiTextField-root': { m: 1, minWidth: 250 },
          }}
        >
          <h1>Login</h1>
          <Form
            method="post"
            aria-describedby={
              actionData?.formError ? 'form-error-message' : undefined
            }
          >
            <div>
              <FormControl>
                <TextField
                  name="email"
                  label="Email"
                  variant="outlined"
                  defaultValue={actionData?.fields?.email}
                />
              </FormControl>
              {actionData?.fieldErrors?.email ? (
                <p role="alert" id="email-error">
                  {actionData.fieldErrors.email}
                </p>
              ) : null}
            </div>
            <div>
              <FormControl>
                <TextField
                  name="password"
                  label="Password"
                  variant="outlined"
                  type="password"
                  defaultValue={actionData?.fields?.password}
                />
              </FormControl>
              {actionData?.fieldErrors?.password ? (
                <p role="alert" id="password-error">
                  {actionData.fieldErrors.password}
                </p>
              ) : null}
            </div>
            <div id="form-error-message">
              {actionData?.formError ? (
                <p role="alert">{actionData.formError}</p>
              ) : null}
            </div>

            <Button
              type="submit"
              className="button"
              variant="contained"
              sx={{ m: 1, minWidth: 250 }}
            >
              Login
            </Button>
          </Form>
        </Paper>
      </Grid>
    </Grid>
  );
}
