import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "@inertiajs/react";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox";
const Login = () => {

    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        'email': '',
        'password': '',
        'remember': false,
    });

    function submit(e) {
        e.preventDefault();

        post('/login', {
            onError: () => reset('password'),
        });
    }


    const FieldError = ({ message }) => (
        <p role="alert" className="min-h-5 text-sm text-destructive wrap-break">
            {message}
        </p>
    );
    return (

        <div className="grid min-h-screen lg:grid-cols-2 bg">
            <div className="flex items-center justify-center p-6 md:p-10">
                <form onSubmit={submit} className="w-full max-w-sm space-y-6">

                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold">Welcome back</h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email and password to log in
                        </p>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            aria-invalid={!!errors.email}
                        />
                        <FieldError message={errors.email} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className="pr-10"
                                aria-invalid={!!errors.password}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </Button>
                        </div>
                        <FieldError message={errors.password} />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked === true)} />
                        <Label htmlFor="remember" className="mb-0">Remember me</Label>
                    </div>

                    <Button type="submit" disabled={processing} className='w-full mt-2'>
                        {processing ? 'Logging in...' : 'Login'}
                    </Button>

                </form >
            </div>


            <div className="relative hidden lg:block">
                <img
                    src="/images/bg-image.jpg"
                    alt="Background"
                    className="absolute inset-0 h-full w-full object-cover object-bottom"
                />

                <div className="glass">

                </div>
            </div>
        </div>

    );
}

export default Login;