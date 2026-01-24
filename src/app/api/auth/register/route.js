import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import encryptPassword from '@/lib/encryptPassword';

export async function POST(req) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const { email, password, firstName, lastName } = await req.json();
  // check if the email exist at all
  if (!email || !email.trim()) {
    return NextResponse.json(
      {
        error: 'Email Address is required',
      },
      {
        status: 400,
      }
    );
  }
  //check if the email meets the required format
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      {
        error: 'Please enter a valid email address',
      },
      {
        status: 400,
      }
    );
  }
  // check if firstname exist
  if (!firstName || !firstName.trim()) {
    return NextResponse.json(
      { error: 'First Name is required' },
      {
        status: 400,
      }
    );
  }
  // check if the first name is less than 3 characters
  if (firstName.trim().length < 3) {
    return NextResponse.json(
      { error: 'First Name must be at least 3 characters long' },
      { status: 400 }
    );
  }
  // check if lastname exist
  if (!lastName || !lastName.trim()) {
    return NextResponse.json(
      {
        error: 'Last Name is required',
      },
      {
        status: 400,
      }
    );
  }
  // check if the last name is less than 3 characters
  if (lastName.trim().length < 3) {
    return NextResponse.json(
      {
        error: 'Last Name must be at least 3 characters long',
      },
      {
        status: 400,
      }
    );
  }
  // check if password exist
  if (!password || !password.trim()) {
    return NextResponse.json(
      {
        error: 'Password is required',
      },
      {
        status: 400,
      }
    );
  }
  // check if the password is less than 8 characters
  if (password.trim().length < 8) {
    return NextResponse.json(
      {
        error: 'Password must be at least 8 characters long',
      },
      {
        status: 400,
      }
    );
  }

  try {
    // connect to database
    await connectDB();
    // check if the user already exist
    const existingUser = await User.findOne({ email: email });
    // if user exist return an error
    if (existingUser) {
      return NextResponse.json(
        { error: 'Account already exists' },
        {
          status: 401,
        }
      );
    }
    // create a new user
    const newUser = await User.create({
      email: email,
      firstName: firstName,
      lastName: lastName,
      password: await encryptPassword(password),
    });

    // success
    return NextResponse.json(
      {
        message: 'POST a new User',
        user: {
          id: newUser._id,
        },
      },
      { status: '200' }
    );
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return NextResponse.json(
        {
          error: messages.join(', '),
        },
        {
          status: 400,
        }
      );
    }
    return NextResponse.json(
      {
        error: 'An error Occurred while creating an account for user',
      },
      {
        status: 500,
      }
    );
  }
}

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { email, password, firstName, lastName, role = ROLES.PATIENT } = body;

//     // Validate required fields
//     if (!email || !password || !firstName || !lastName) {
//       return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
//     }

//     // Validate role
//     if (!Object.values(ROLES).includes(role)) {
//       return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
//     }

//     // Connect to database
//     await connectDB();

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return NextResponse.json(
//         { error: 'User with this email already exists' },
//         { status: 409 }
//       );
//     }

//     // TODO: Hash password with bcrypt before saving
//     // const hashedPassword = await bcrypt.hash(password, 12);

//     // Create new user
//     const user = await User.create({
//       email,
//       password, // Should be hashedPassword in production
//       firstName,
//       lastName,
//       role,
//     });

//     // Return created user without password
//     const userData = {
//       id: user._id,
//       email: user.email,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       role: user.role,
//     };

//     return NextResponse.json(
//       {
//         success: true,
//         message: 'User created successfully',
//         user: userData,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error('Registration error:', error);

//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map((e) => e.message);
//       return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
//     }

//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }
